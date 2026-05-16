# RemitSol

> **Send money home in 4 seconds.**
> Stablecoin remittance from the Gulf to Pakistan & India, built on Solana.

[![Live demo](https://img.shields.io/badge/demo-remitsol.vercel.app-0F7A4F?style=for-the-badge)](https://remitsol.vercel.app)
[![Program](https://img.shields.io/badge/program-HhNrDYKVCq9Hx...RKxTa-2DBE7E?style=for-the-badge)](https://explorer.solana.com/address/HhNrDYKVCq9Hx9tgyWVbbtrhFnVxQqWW2iHSqn3RKxTa?cluster=devnet)
[![Solana](https://img.shields.io/badge/network-devnet-9945FF?style=for-the-badge)](https://docs.solana.com/clusters)

---

## What

Pakistan received ~**$30B** in remittances in 2024, mostly from Gulf workers,
and lost **~$1.5B** of it to Western Union–style fees and 1–3 day settlement.

RemitSol is the simplest possible alternative:

1. Sender in Dubai opens `remitsol.app`, taps **Send**, pays in USDC.
2. We generate a 6-digit claim code, share it to WhatsApp.
3. Recipient in Sahiwal opens the link, taps **Claim**, receives USDC.
4. Recipient taps **Cash out**, gets PKR via Easypaisa / JazzCash.

End-to-end in under 30 seconds on a phone. Fees are sub-cent.

See [PRD.md](./PRD.md) for the full product spec.

---

## Stack

| Layer | Choice |
|---|---|
| On-chain | Anchor 0.30.1 program on Solana Devnet |
| Frontend | Next.js 16 (App Router) + Tailwind v4 + Framer Motion |
| Wallet | `@solana/wallet-adapter` (Phantom, Solflare) |
| Token | Mock USDC (SPL Token, 6 decimals) via `scripts/airdrop-usdc.ts` |
| Charts | Recharts |
| Toasts | Sonner |
| PWA | Native manifest (`public/manifest.webmanifest`) |

---

## Run locally (5 minutes)

```bash
# 1. Install
npm install
(cd apps/web && npm install)

# 2. Make sure your solana CLI is on devnet and has SOL
solana config set --url https://api.devnet.solana.com
solana airdrop 2

# 3. (Optional) Anchor build + redeploy. The program is already deployed.
anchor build
anchor deploy --provider.cluster devnet

# 4. Create the mock USDC mint (one-time)
npx ts-node scripts/airdrop-usdc.ts init
# → copy the printed mint into apps/web/.env.local as NEXT_PUBLIC_USDC_MINT

# 5. Airdrop mock USDC to your Phantom wallet
npx ts-node scripts/airdrop-usdc.ts mint <YOUR_PHANTOM_PUBKEY>

# 6. Run the web app
cd apps/web
cp .env.example .env.local   # fill in Helius RPC + the USDC mint from step 4
npm run dev
```

Open http://localhost:3000.

---

## Architecture

```
sender wallet ──▶ create_transfer(claim_code_hash, amount)
                  │
                  ▼
   ┌─────────────────────────────────────────┐
   │  TransferState PDA                      │
   │  seeds = ["transfer", sender, hash]     │
   │  ─ amount, mint, sender, claimed=false  │
   └────────┬────────────────────────────────┘
            │ owns
            ▼
   ┌─────────────────────────────────────────┐
   │  Escrow Token Account PDA               │
   │  seeds = ["escrow", transfer_pda]       │
   │  holds the USDC                         │
   └────────┬────────────────────────────────┘
            │
            │  sha256(claim_code) == claim_code_hash
            ▼
recipient wallet ◀── claim_transfer(claim_code)
```

- Program: [`programs/remitsol/src/lib.rs`](programs/remitsol/src/lib.rs)
- IDL (handwritten, matches Anchor 0.30 spec): [`apps/web/lib/idl/remitsol.json`](apps/web/lib/idl/remitsol.json)
- Anchor client: [`apps/web/lib/anchor-client.ts`](apps/web/lib/anchor-client.ts)

---

## What's mocked, what's real

| Component | Real or mocked? |
|---|---|
| `create_transfer` / `claim_transfer` | **Real** — running on Solana devnet |
| USDC escrow PDA | **Real** — SPL token transfer via CPI |
| 6-digit claim code → SHA-256 hash check | **Real** — verified on-chain |
| USDC mint | **Mock** — we create our own 6-decimal SPL token because devnet faucets are flaky |
| Easypaisa / JazzCash cash-out | **Mock UI** — corridor partnership is on the roadmap |
| Community leaderboard | **Mock data** — on-chain indexing comes with v1.1 |

---

## Demo script

See [DEMO.md](./DEMO.md) for the 3-minute video script we use in the submission.

---

## Roadmap

- v1.1 — Real JazzCash / Easypaisa corridor pilot
- v1.2 — Account abstraction / gasless onboarding (recipients don't need SOL)
- v1.3 — Multi-currency display (PKR, INR, PHP, BDT, NPR)
- v2.0 — Sender on-ramp from Gulf debit cards
- v3.0 — Compliance-ready KYC for partners that need it

---

## License

MIT.
