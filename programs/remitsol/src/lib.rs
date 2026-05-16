use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, Token, TokenAccount, Transfer};

declare_id!("HhNrDYKVCq9Hx9tgyWVbbtrhFnVxQqWW2iHSqn3RKxTa");

#[program]
pub mod remitsol {
    use super::*;

    pub fn create_transfer(
        ctx: Context<CreateTransfer>,
        claim_code_hash: [u8; 32],
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, RemitError::ZeroAmount);

        let transfer = &mut ctx.accounts.transfer_state;
        transfer.sender = ctx.accounts.sender.key();
        transfer.claim_code_hash = claim_code_hash;
        transfer.amount = amount;
        transfer.mint = ctx.accounts.mint.key();
        transfer.claimed = false;
        transfer.created_at = Clock::get()?.unix_timestamp;
        transfer.bump = ctx.bumps.transfer_state;

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.sender_token_account.to_account_info(),
                to: ctx.accounts.escrow_token_account.to_account_info(),
                authority: ctx.accounts.sender.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, amount)?;
        Ok(())
    }

    pub fn claim_transfer(ctx: Context<ClaimTransfer>, claim_code: String) -> Result<()> {
        let transfer = &mut ctx.accounts.transfer_state;
        require!(!transfer.claimed, RemitError::AlreadyClaimed);

        let hash = anchor_lang::solana_program::hash::hash(claim_code.as_bytes()).to_bytes();
        require!(hash == transfer.claim_code_hash, RemitError::InvalidCode);

        let sender_key = transfer.sender;
        let seeds = &[
            b"transfer",
            sender_key.as_ref(),
            &transfer.claim_code_hash,
            &[transfer.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.recipient_token_account.to_account_info(),
                authority: transfer.to_account_info(),
            },
            signer,
        );
        token::transfer(cpi_ctx, transfer.amount)?;
        transfer.claimed = true;
        Ok(())
    }

    /// The sender reclaims funds that were never claimed.
    /// Refunds escrowed USDC back to the sender, closes the escrow token
    /// account, and closes the transfer state — recovering the rent on both.
    pub fn cancel_transfer(ctx: Context<CancelTransfer>) -> Result<()> {
        let transfer = &ctx.accounts.transfer_state;
        require!(!transfer.claimed, RemitError::AlreadyClaimed);
        require!(
            transfer.sender == ctx.accounts.sender.key(),
            RemitError::Unauthorized
        );

        let sender_key = transfer.sender;
        let seeds = &[
            b"transfer",
            sender_key.as_ref(),
            &transfer.claim_code_hash,
            &[transfer.bump],
        ];
        let signer = &[&seeds[..]];

        // 1) Move USDC from escrow back to sender.
        let amount = transfer.amount;
        let transfer_cpi = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.sender_token_account.to_account_info(),
                authority: transfer.to_account_info(),
            },
            signer,
        );
        token::transfer(transfer_cpi, amount)?;

        // 2) Close the now-empty escrow token account back to sender.
        let close_cpi = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            CloseAccount {
                account: ctx.accounts.escrow_token_account.to_account_info(),
                destination: ctx.accounts.sender.to_account_info(),
                authority: transfer.to_account_info(),
            },
            signer,
        );
        token::close_account(close_cpi)?;

        // 3) The transfer_state account is closed via the `close = sender` attribute.
        Ok(())
    }
}

#[account]
pub struct TransferState {
    pub sender: Pubkey,
    pub claim_code_hash: [u8; 32],
    pub amount: u64,
    pub mint: Pubkey,
    pub claimed: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(claim_code_hash: [u8; 32])]
pub struct CreateTransfer<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    #[account(
        init,
        payer = sender,
        space = 8 + 32 + 32 + 8 + 32 + 1 + 8 + 1,
        seeds = [b"transfer", sender.key().as_ref(), &claim_code_hash],
        bump
    )]
    pub transfer_state: Account<'info, TransferState>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub sender_token_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = sender,
        token::mint = mint,
        token::authority = transfer_state,
        seeds = [b"escrow", transfer_state.key().as_ref()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimTransfer<'info> {
    #[account(mut)]
    pub recipient: Signer<'info>,
    #[account(mut)]
    pub transfer_state: Account<'info, TransferState>,
    #[account(
        mut,
        seeds = [b"escrow", transfer_state.key().as_ref()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelTransfer<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    #[account(
        mut,
        close = sender,
        has_one = sender @ RemitError::Unauthorized,
    )]
    pub transfer_state: Account<'info, TransferState>,
    #[account(
        mut,
        seeds = [b"escrow", transfer_state.key().as_ref()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub sender_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum RemitError {
    #[msg("Transfer already claimed")]
    AlreadyClaimed,
    #[msg("Invalid claim code")]
    InvalidCode,
    #[msg("Only the original sender can cancel this transfer")]
    Unauthorized,
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
}
