"use client";

import { useCallback, useEffect, useState } from "react";
import { BN } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useProgram } from "./useProgram";
import { hashClaimCode } from "@/lib/claim-code";
import { deriveEscrowPda, deriveTransferPda } from "@/lib/pda";
import { ensureAtaIx, getUsdcAta, toUsdcBaseUnits } from "@/lib/usdc";
import { USDC_MINT } from "@/lib/constants";

export function useCreateTransfer() {
  const program = useProgram();
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  return useCallback(
    async (claimCode: string, uiAmount: number) => {
      if (!program || !publicKey) throw new Error("Wallet not connected");
      const hash = hashClaimCode(claimCode);
      const [transferPda] = deriveTransferPda(publicKey, hash);
      const [escrowPda] = deriveEscrowPda(transferPda);
      const senderAta = getUsdcAta(publicKey);

      const senderAtaInfo = await connection.getAccountInfo(senderAta);
      if (!senderAtaInfo) {
        throw new Error("You don't have a USDC token account yet. Get devnet USDC first.");
      }

      const sig = await program.methods
        .create_transfer(Array.from(hash) as unknown as number[], new BN(toUsdcBaseUnits(uiAmount).toString()))
        .accounts({
          sender: publicKey,
          transfer_state: transferPda,
          mint: USDC_MINT,
          sender_token_account: senderAta,
          escrow_token_account: escrowPda,
          token_program: TOKEN_PROGRAM_ID,
          system_program: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        } as never)
        .rpc({ commitment: "confirmed" });

      return { signature: sig, transferPda };
    },
    [program, publicKey, connection],
  );
}

export function useClaimTransfer() {
  const program = useProgram();
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  return useCallback(
    async (claimCode: string, senderPubkey: PublicKey) => {
      if (!program || !publicKey) throw new Error("Wallet not connected");
      const hash = hashClaimCode(claimCode);
      const [transferPda] = deriveTransferPda(senderPubkey, hash);
      const [escrowPda] = deriveEscrowPda(transferPda);

      const { ata: recipientAta, ix: ataIx } = await ensureAtaIx(
        connection,
        publicKey,
        publicKey,
      );

      const builder = program.methods
        .claim_transfer(claimCode)
        .accounts({
          recipient: publicKey,
          transfer_state: transferPda,
          escrow_token_account: escrowPda,
          recipient_token_account: recipientAta,
          token_program: TOKEN_PROGRAM_ID,
        } as never);

      if (ataIx) builder.preInstructions([ataIx]);

      const sig = await builder.rpc({ commitment: "confirmed" });
      return { signature: sig, transferPda };
    },
    [program, publicKey, connection],
  );
}

export function useCancelTransfer() {
  const program = useProgram();
  const { publicKey } = useWallet();

  return useCallback(
    async (transferPda: PublicKey) => {
      if (!program || !publicKey) throw new Error("Wallet not connected");
      const [escrowPda] = deriveEscrowPda(transferPda);
      const senderAta = getUsdcAta(publicKey);

      const sig = await program.methods
        .cancel_transfer()
        .accounts({
          sender: publicKey,
          transfer_state: transferPda,
          escrow_token_account: escrowPda,
          sender_token_account: senderAta,
          token_program: TOKEN_PROGRAM_ID,
        } as never)
        .rpc({ commitment: "confirmed" });

      return { signature: sig };
    },
    [program, publicKey],
  );
}

export type TransferRow = {
  pda: string;
  amount: number; // ui amount in USDC
  createdAt: number; // unix seconds
  claimed: boolean;
};

/**
 * Lists transfers initiated by the connected wallet using getProgramAccounts
 * filtered by the `sender` field of TransferState.
 *
 * The TransferState struct layout (in order):
 *   [0..8]   anchor discriminator
 *   [8..40]  sender pubkey (32)
 *   [40..72] claim_code_hash (32)
 *   [72..80] amount (u64 LE)
 *   [80..112] mint (32)
 *   [112]    claimed (bool)
 *   [113..121] created_at (i64 LE)
 *   [121]    bump (u8)
 */
export function useMyTransfers() {
  const program = useProgram();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [rows, setRows] = useState<TransferRow[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!program || !publicKey) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const accounts = await connection.getProgramAccounts(program.programId, {
        filters: [
          { dataSize: 8 + 32 + 32 + 8 + 32 + 1 + 8 + 1 }, // exact size of TransferState
          { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
        ],
      });

      const out: TransferRow[] = accounts.map(({ pubkey, account }) => {
        const data = account.data;
        const amountLE = data.subarray(72, 80);
        let amt = BigInt(0);
        for (let i = 0; i < 8; i++) amt |= BigInt(amountLE[i]) << BigInt(8 * i);
        const claimed = data[112] === 1;
        const tsLE = data.subarray(113, 121);
        let ts = BigInt(0);
        for (let i = 0; i < 8; i++) ts |= BigInt(tsLE[i]) << BigInt(8 * i);
        return {
          pda: pubkey.toBase58(),
          amount: Number(amt) / 1_000_000,
          createdAt: Number(ts),
          claimed,
        };
      });

      out.sort((a, b) => b.createdAt - a.createdAt);
      setRows(out);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey, connection]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { rows, loading, refresh };
}
