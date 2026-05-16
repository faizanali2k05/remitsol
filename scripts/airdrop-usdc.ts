/**
 * RemitSol mock-USDC helper.
 *
 * Usage (from repo root):
 *
 *   # 1. One-time: create the mock USDC mint. Prints the mint address.
 *   #    Save it to apps/web/.env.local as NEXT_PUBLIC_USDC_MINT.
 *   npx ts-node scripts/airdrop-usdc.ts init
 *
 *   # 2. Airdrop 1000 mock USDC to any wallet (your Phantom, recipient, judges).
 *   npx ts-node scripts/airdrop-usdc.ts mint <RECIPIENT_PUBKEY>
 *
 * The mint authority is your local solana CLI keypair
 * (~/.config/solana/id.json) — keep that key safe; it can mint unlimited
 * mock USDC for the demo.
 */

import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const DECIMALS = 6;
const AIRDROP_UI = 1000;

function loadCliKeypair(): Keypair {
  const path =
    process.env.ANCHOR_WALLET ?? join(homedir(), ".config/solana/id.json");
  const raw = JSON.parse(readFileSync(path, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

async function main() {
  const [cmd, arg] = process.argv.slice(2);
  if (!cmd || !["init", "mint"].includes(cmd)) {
    console.error("Usage: ts-node scripts/airdrop-usdc.ts <init|mint> [recipient]");
    process.exit(1);
  }

  const rpc = process.env.SOLANA_RPC ?? clusterApiUrl("devnet");
  const conn = new Connection(rpc, "confirmed");
  const payer = loadCliKeypair();
  console.log(`payer: ${payer.publicKey.toBase58()}`);

  if (cmd === "init") {
    const mint = await createMint(
      conn,
      payer,
      payer.publicKey,
      null,
      DECIMALS,
    );
    console.log(`\nMock USDC mint created:\n  ${mint.toBase58()}\n`);
    console.log(
      "→ Put this in apps/web/.env.local:\n" +
        `  NEXT_PUBLIC_USDC_MINT=${mint.toBase58()}\n`,
    );
    return;
  }

  if (cmd === "mint") {
    if (!arg) {
      console.error("Provide a recipient wallet: scripts/airdrop-usdc.ts mint <PUBKEY>");
      process.exit(1);
    }
    const mintEnv = process.env.NEXT_PUBLIC_USDC_MINT;
    if (!mintEnv) {
      console.error("Set NEXT_PUBLIC_USDC_MINT in your env first (run `init`).");
      process.exit(1);
    }
    const mint = new PublicKey(mintEnv);
    const recipient = new PublicKey(arg);

    const ata = await getOrCreateAssociatedTokenAccount(
      conn,
      payer,
      mint,
      recipient,
    );
    const sig = await mintTo(
      conn,
      payer,
      mint,
      ata.address,
      payer,
      BigInt(AIRDROP_UI * 10 ** DECIMALS),
    );
    console.log(`\nMinted ${AIRDROP_UI} mock USDC to ${recipient.toBase58()}`);
    console.log(`  ata: ${ata.address.toBase58()}`);
    console.log(`  sig: ${sig}\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
