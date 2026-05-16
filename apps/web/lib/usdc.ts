import {
  getAssociatedTokenAddressSync,
  getAccount,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { USDC_DECIMALS, USDC_MINT } from "./constants";

export function getUsdcAta(owner: PublicKey, mint: PublicKey = USDC_MINT) {
  return getAssociatedTokenAddressSync(
    mint,
    owner,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
}

export async function getUsdcUiBalance(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey = USDC_MINT,
): Promise<number> {
  try {
    const ata = getUsdcAta(owner, mint);
    const acc = await getAccount(connection, ata);
    return Number(acc.amount) / 10 ** USDC_DECIMALS;
  } catch {
    return 0;
  }
}

export async function ensureAtaIx(
  connection: Connection,
  payer: PublicKey,
  owner: PublicKey,
  mint: PublicKey = USDC_MINT,
): Promise<{ ata: PublicKey; ix: TransactionInstruction | null }> {
  const ata = getUsdcAta(owner, mint);
  const info = await connection.getAccountInfo(ata);
  if (info) return { ata, ix: null };
  return {
    ata,
    ix: createAssociatedTokenAccountInstruction(payer, ata, owner, mint),
  };
}

export function toUsdcBaseUnits(uiAmount: number): bigint {
  return BigInt(Math.round(uiAmount * 10 ** USDC_DECIMALS));
}

export function fromUsdcBaseUnits(base: bigint | number): number {
  return Number(base) / 10 ** USDC_DECIMALS;
}
