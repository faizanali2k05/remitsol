import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { createHash } from "crypto";
import { assert } from "chai";
import { Remitsol } from "../target/types/remitsol";

describe("remitsol", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Remitsol as Program<Remitsol>;
  const conn = provider.connection;

  const sender = (provider.wallet as anchor.Wallet).payer;
  const recipient = Keypair.generate();

  let mint: PublicKey;
  let senderAta: PublicKey;
  let recipientAta: PublicKey;

  function hashCode(code: string): number[] {
    return Array.from(createHash("sha256").update(code).digest());
  }

  function deriveTransferPda(senderKey: PublicKey, hash: number[]): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("transfer"), senderKey.toBuffer(), Buffer.from(hash)],
      program.programId,
    )[0];
  }

  function deriveEscrowPda(transferPda: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), transferPda.toBuffer()],
      program.programId,
    )[0];
  }

  before("set up mock USDC and ATAs", async () => {
    await conn.confirmTransaction(
      await conn.requestAirdrop(recipient.publicKey, 2 * LAMPORTS_PER_SOL),
    );

    mint = await createMint(conn, sender, sender.publicKey, null, 6);
    senderAta = await createAssociatedTokenAccount(conn, sender, mint, sender.publicKey);
    recipientAta = await createAssociatedTokenAccount(conn, recipient, mint, recipient.publicKey);

    await mintTo(conn, sender, mint, senderAta, sender, 1_000_000_000n); // 1000 USDC
  });

  it("create → claim happy path", async () => {
    const code = "123456";
    const hash = hashCode(code);
    const amount = new BN(200_000_000); // 200 USDC

    const transferPda = deriveTransferPda(sender.publicKey, hash);
    const escrowPda = deriveEscrowPda(transferPda);

    await program.methods
      .createTransfer(hash as any, amount)
      .accountsStrict({
        sender: sender.publicKey,
        transferState: transferPda,
        mint,
        senderTokenAccount: senderAta,
        escrowTokenAccount: escrowPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      } as any)
      .rpc();

    const escrowAfterCreate = await getAccount(conn, escrowPda);
    assert.equal(escrowAfterCreate.amount.toString(), "200000000", "escrow funded");

    await program.methods
      .claimTransfer(code)
      .accountsStrict({
        recipient: recipient.publicKey,
        transferState: transferPda,
        escrowTokenAccount: escrowPda,
        recipientTokenAccount: recipientAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .signers([recipient])
      .rpc();

    const recipientBal = await getAccount(conn, recipientAta);
    assert.equal(recipientBal.amount.toString(), "200000000", "recipient credited");

    const state = await (program.account as any).transferState.fetch(transferPda);
    assert.isTrue(state.claimed, "state marked claimed");
  });

  it("rejects an invalid claim code", async () => {
    const code = "999000";
    const wrong = "111222";
    const hash = hashCode(code);

    const transferPda = deriveTransferPda(sender.publicKey, hash);
    const escrowPda = deriveEscrowPda(transferPda);

    await program.methods
      .createTransfer(hash as any, new BN(50_000_000))
      .accountsStrict({
        sender: sender.publicKey,
        transferState: transferPda,
        mint,
        senderTokenAccount: senderAta,
        escrowTokenAccount: escrowPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      } as any)
      .rpc();

    try {
      await program.methods
        .claimTransfer(wrong)
        .accountsStrict({
          recipient: recipient.publicKey,
          transferState: transferPda,
          escrowTokenAccount: escrowPda,
          recipientTokenAccount: recipientAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        } as any)
        .signers([recipient])
        .rpc();
      assert.fail("should have rejected wrong code");
    } catch (err: any) {
      assert.include(err.toString().toLowerCase(), "invalidcode");
    }

    // Sender can still cancel and recover the funds.
    await program.methods
      .cancelTransfer()
      .accountsStrict({
        sender: sender.publicKey,
        transferState: transferPda,
        escrowTokenAccount: escrowPda,
        senderTokenAccount: senderAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .rpc();

    const escrowAcc = await conn.getAccountInfo(escrowPda);
    assert.isNull(escrowAcc, "escrow closed on cancel");

    const stateAcc = await conn.getAccountInfo(transferPda);
    assert.isNull(stateAcc, "transfer state closed on cancel");
  });

  it("non-sender cannot cancel", async () => {
    const code = "424242";
    const hash = hashCode(code);
    const transferPda = deriveTransferPda(sender.publicKey, hash);
    const escrowPda = deriveEscrowPda(transferPda);

    await program.methods
      .createTransfer(hash as any, new BN(10_000_000))
      .accountsStrict({
        sender: sender.publicKey,
        transferState: transferPda,
        mint,
        senderTokenAccount: senderAta,
        escrowTokenAccount: escrowPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      } as any)
      .rpc();

    try {
      await program.methods
        .cancelTransfer()
        .accountsStrict({
          sender: recipient.publicKey,
          transferState: transferPda,
          escrowTokenAccount: escrowPda,
          senderTokenAccount: recipientAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        } as any)
        .signers([recipient])
        .rpc();
      assert.fail("non-sender should not be able to cancel");
    } catch (err: any) {
      const msg = err.toString().toLowerCase();
      assert.isTrue(
        msg.includes("unauthorized") || msg.includes("constraint") || msg.includes("has_one"),
        `expected auth error, got: ${msg}`,
      );
    }
  });
});
