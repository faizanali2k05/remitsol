use anchor_lang::prelude::*;

declare_id!("HhNrDYKVCq9Hx9tgyWVbbtrhFnVxQqWW2iHSqn3RKxTa");

#[program]
pub mod remitsol {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
