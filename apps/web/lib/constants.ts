import { PublicKey } from "@solana/web3.js";

export const REMITSOL_PROGRAM_ID = new PublicKey(
  "HhNrDYKVCq9Hx9tgyWVbbtrhFnVxQqWW2iHSqn3RKxTa",
);

// Mock USDC mint created by `scripts/airdrop-usdc.ts`.
// Override via NEXT_PUBLIC_USDC_MINT in .env.local once you've run the script.
export const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT ??
    "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr", // placeholder, swap after running mint script
);

export const USDC_DECIMALS = 6;

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC ?? "https://api.devnet.solana.com";

// Display-only conversion rate. Update freely; the chain doesn't see this.
export const PKR_PER_USD = 280;

// Reference fees for the comparison widget.
export const WESTERN_UNION_FEE_USD = 14.5; // typical fee on a $200 transfer
export const REMITSOL_FEE_USD = 0.0004; // ~5000 lamports * SOL price, rounded
export const WESTERN_UNION_SETTLE_SECONDS = 60 * 60 * 24 * 2; // 2 days
export const REMITSOL_SETTLE_SECONDS = 4;

// Aggregate display stat for the landing/stats page.
// Wire to on-chain index later — fake for v1.
export const TOTAL_FEES_SAVED_USD_BASE = 18742.51;
