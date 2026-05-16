import { sha256 } from "@noble/hashes/sha256";

// 6-digit numeric claim code. Easy to share over WhatsApp / SMS.
export function generateClaimCode(): string {
  const buf = new Uint8Array(4);
  crypto.getRandomValues(buf);
  const n =
    ((buf[0] << 24) | (buf[1] << 16) | (buf[2] << 8) | buf[3]) >>> 0;
  return (n % 1_000_000).toString().padStart(6, "0");
}

// Matches `anchor_lang::solana_program::hash::hash` on-chain — Solana uses SHA-256.
export function hashClaimCode(code: string): Uint8Array {
  return sha256(new TextEncoder().encode(code));
}
