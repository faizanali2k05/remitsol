import { PublicKey } from "@solana/web3.js";
import { REMITSOL_PROGRAM_ID } from "./constants";

export function deriveTransferPda(
  sender: PublicKey,
  claimCodeHash: Uint8Array,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("transfer"), sender.toBuffer(), Buffer.from(claimCodeHash)],
    REMITSOL_PROGRAM_ID,
  );
}

export function deriveEscrowPda(transferPda: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), transferPda.toBuffer()],
    REMITSOL_PROGRAM_ID,
  );
}
