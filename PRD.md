# RemitSol — Product Requirements Document

> **Stablecoin remittance from the Gulf to Pakistan, in 4 seconds, for fractions of a cent.**
> A mobile-first PWA built on Solana for the Colosseum hackathon.

---

## 1. Executive Summary

**RemitSol** is a mobile-first progressive web app that lets a sender in the Gulf (UAE, Saudi Arabia, Qatar, Oman) send USDC to a recipient in Pakistan or India in under five seconds, for under one cent in fees. Recipients claim funds with a 6-digit code shared over WhatsApp and cash out through a mobile-money off-ramp (JazzCash / Easypaisa).

| | Western Union | Wise | **RemitSol** |
|---|---|---|---|
| Fee on $200 | $14–$25 | $4–$8 | **<$0.01** |
| Settlement time | 1–3 days | 1–2 days | **~4 seconds** |
| KYC for recipient | Required | Required | **Wallet-only** |
| Hours to claim | Branch hours | Bank hours | **24/7** |

Solana's 400ms block time and sub-cent fees make this the textbook killer app for stablecoins on a fast chain.

---

## 2. Problem

- Pakistan received **~$30B in remittances in 2024**, mostly from Gulf workers.
- Average corridor fee is **5.7%** (~$1.7B in fees per year).
- Settlement takes **1–3 business days**.
- The recipient often has to travel to a Western Union branch and queue.
- Bank wires require IBAN, KYC, and minimum amounts that exclude lower-paid workers sending $50–$200 at a time.

The people most hurt by remittance fees are exactly the people who can least afford them.

---

## 3. Vision & Positioning

> **"The cheapest, fastest way to send money home — no bank, no branch, no waiting."**

- **Primary persona:** a 28-year-old construction worker in Dubai sending AED 800 (~$200) home twice a month.
- **Secondary persona:** the recipient (his mother in Sahiwal, Pakistan) who needs PKR, not USDC, and has Easypaisa on her phone.
- **Wedge:** USDC + Solana + WhatsApp claim code + mock mobile-money off-ramp. No bank account required on either side.

---

## 4. User Stories

### Sender (Dubai)
1. As a sender, I open `remitsol.app` on my phone and connect Phantom in one tap.
2. As a sender, I enter an amount in USDC and tap **Send**, and I see exactly how much my recipient will receive in PKR and how much I just saved vs. Western Union.
3. As a sender, I get a 6-digit claim code and a pre-filled WhatsApp share button so I can send it to my mother in one tap.
4. As a sender, I can see the status of every transfer I've made (pending / claimed / expired).

### Recipient (Sahiwal)
5. As a recipient, I tap the WhatsApp link, the app opens, I enter the 6-digit code, and I see how much I'm about to receive.
6. As a recipient, I tap **Claim**, sign with Phantom, and the USDC lands in my wallet in ~4 seconds.
7. As a recipient, I tap **Cash out to Easypaisa**, enter my mobile number, and see a confirmation screen ("PKR 56,000 sent to +92 3xx xxx xxxx").

### Observer / Judge
8. As a visitor to the landing page, I instantly understand the value proposition — Western Union price + delay on the left, RemitSol price + speed on the right, animated.
9. As a visitor to the stats page, I see total fees saved by the RemitSol community in real time.

---

## 5. Scope (Hackathon v1)

### In scope
- ✅ Anchor program with `create_transfer` and `claim_transfer` (deployed to devnet).
- ⬜ Wallet adapter (Phantom, Solflare, Backpack) wired into Next.js.
- ⬜ Sender flow: amount input → claim-code generation → signed `create_transfer` → success screen with WhatsApp share.
- ⬜ Recipient flow: `/claim/[code]` → signed `claim_transfer` → mock Easypaisa cash-out screen.
- ⬜ Landing page with animated Western Union vs. RemitSol fee/speed comparison.
- ⬜ Stats page with mock community leaderboard ("$X saved this week").
- ⬜ Devnet USDC integration (Circle's devnet mint).
- ⬜ PWA manifest + icons (installable to iOS/Android home screen).
- ⬜ Mobile-first responsive design.
- ⬜ One happy-path Anchor test.
- ⬜ README + 3-min demo video script + Colosseum submission copy.

### Out of scope (explicitly stated as roadmap)
- ❌ Real fiat off-ramp (JazzCash/Easypaisa API integration) — mocked.
- ❌ KYC / AML.
- ❌ Multi-currency support (USDC only at v1; PKR/INR/PHP on roadmap).
- ❌ Mainnet deployment.
- ❌ Backend server or database (everything is on-chain or in-browser).
- ❌ Account abstraction / gasless onboarding for recipients (v2).
- ❌ `cancel_transfer` instruction (optional polish if time permits).

---

## 6. Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 15 PWA (Vercel)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Landing  │  │   Send   │  │  Claim   │  │   Stats    │  │
│  │   page   │  │   flow   │  │   flow   │  │  page      │  │
│  └────┬─────┘  └─────┬────┘  └─────┬────┘  └─────┬──────┘  │
│       │              │             │             │          │
│  ┌────┴──────────────┴─────────────┴─────────────┴──────┐  │
│  │  @solana/wallet-adapter  │  @coral-xyz/anchor client │  │
│  └─────────────────┬──────────────────┬─────────────────┘  │
└────────────────────┼──────────────────┼─────────────────────┘
                     │                  │
              ┌──────┴──────┐    ┌──────┴────────────┐
              │   Phantom   │    │  Helius RPC       │
              │   Mobile    │    │  (devnet)         │
              └─────────────┘    └──────┬────────────┘
                                        │
                            ┌───────────┴────────────┐
                            │   Solana Devnet        │
                            │  ┌──────────────────┐  │
                            │  │ RemitSol Program │  │
                            │  │  (Anchor)        │  │
                            │  │                  │  │
                            │  │ • create_transfer│  │
                            │  │ • claim_transfer │  │
                            │  └────────┬─────────┘  │
                            │           │            │
                            │  ┌────────┴─────────┐  │
                            │  │  PDAs            │  │
                            │  │ • transfer state │  │
                            │  │ • escrow vault   │  │
                            │  └──────────────────┘  │
                            │                        │
                            │  ┌──────────────────┐  │
                            │  │  Devnet USDC     │  │
                            │  │  (SPL Token)     │  │
                            │  └──────────────────┘  │
                            └────────────────────────┘
```

### 6.1 On-chain (Anchor program — already shipped)

**Program ID:** `HhNrDYKVCq9Hx9tgyWVbbtrhFnVxQqWW2iHSqn3RKxTa`
**Network:** Solana Devnet
**Source:** [programs/remitsol/src/lib.rs](programs/remitsol/src/lib.rs)

| Instruction | Inputs | Effect |
|---|---|---|
| `create_transfer` | `claim_code_hash: [u8;32]`, `amount: u64` | Initializes a `TransferState` PDA, opens an escrow token account owned by that PDA, transfers `amount` USDC from sender → escrow. |
| `claim_transfer` | `claim_code: String` | Hashes the code, checks against `claim_code_hash`, transfers escrowed USDC from PDA → recipient ATA, marks `claimed = true`. |

**PDAs**
- `transfer_state`: seeds `["transfer", sender, claim_code_hash]`
- `escrow_token_account`: seeds `["escrow", transfer_state.key()]`

**Errors:** `AlreadyClaimed`, `InvalidCode`.

### 6.2 Frontend stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router, TS) | Already installed. Vercel deploys for free. |
| Styles | Tailwind v4 + shadcn/ui | Fastest path to a polished UI. |
| Animation | Framer Motion | For the fee-comparison "wow" moment. |
| Wallet | `@solana/wallet-adapter-react` + `-wallet-adapter-react-ui` | Standard. Supports Phantom / Solflare / Backpack. |
| Chain client | `@coral-xyz/anchor` + `@solana/web3.js` (v1) | Typed IDL client; v1 has the documentation. |
| Token | `@solana/spl-token` | For USDC transfers and ATA creation. |
| QR | `react-qr-code` | Claim-code QR for in-person handoff. |
| Charts | `recharts` | Fees-saved chart on the stats page. |
| PWA | `next-pwa` | Installable to home screen. |
| Sharing | WhatsApp deep link + Web Share API fallback | Recipient handoff. |
| Toasts | `sonner` | Tx success / failure feedback. |
| Icons | `lucide-react` | Consistent icon set. |

### 6.3 Hosting & infra

- **Frontend:** Vercel free tier → `remitsol.vercel.app`.
- **RPC:** Helius free tier (1M credits/mo); fallback to public devnet RPC.
- **Source:** GitHub public repo (already initialized).
- **CI:** GitHub Actions running `anchor build` + `next build` on every push.
- **Total monthly cost:** $0.

---

## 7. UX Flows

### 7.1 Sender flow (target: under 30 seconds end-to-end)

```
Landing page
   ↓ tap "Send Money Home"
Connect Phantom (1 tap on mobile via deeplink)
   ↓
Send screen
   ├─ Amount input (USDC) → live conversion to PKR
   ├─ "You're saving $24.50 vs Western Union" badge
   └─ [Generate Claim Code & Send]
   ↓
Sign in Phantom
   ↓
Success screen
   ├─ Big 6-digit code: "8 3 9 1 0 2"
   ├─ QR code below
   └─ [Share via WhatsApp] (pre-filled message in Urdu + English)
```

### 7.2 Recipient flow (target: under 45 seconds)

```
WhatsApp message: "Faizan sent you $200. Tap to claim: remitsol.app/claim/839102"
   ↓
Claim page opens with code pre-filled
   ↓
"You're claiming $200 USDC (≈ PKR 56,000)" — big and obvious
   ↓
Connect Phantom
   ↓
[Claim Funds]
   ↓
Sign in Phantom
   ↓
Success: "$200 USDC claimed in 3.8 seconds. Fee: $0.0004."
   ↓
[Cash out to Easypaisa] (mock)
   ↓
Phone number form → confirmation: "PKR 56,000 sent to +92 3xx xxx xxxx"
```

### 7.3 The "wow" moment — landing page

Split-screen animation, looping:
- **Left:** Western Union counter ticking up — fee climbing, days counting down slowly.
- **Right:** RemitSol counter — fee frozen at $0.0004, timer hits 4s and stops.

Below: live community leaderboard. *"Pakistani families have saved $X in fees this week using RemitSol."*

---

## 8. Folder Structure (target)

```
remitsol/
├── programs/remitsol/src/lib.rs          ✅ done
├── apps/web/
│   ├── app/
│   │   ├── layout.tsx                    ⬜ wrap in WalletProvider
│   │   ├── page.tsx                      ⬜ landing
│   │   ├── send/page.tsx                 ⬜ sender flow
│   │   ├── claim/[code]/page.tsx         ⬜ recipient flow
│   │   ├── stats/page.tsx                ⬜ leaderboard
│   │   └── api/                          (none — fully client-side)
│   ├── components/
│   │   ├── wallet/WalletButton.tsx
│   │   ├── wallet/WalletProvider.tsx
│   │   ├── send/AmountInput.tsx
│   │   ├── send/SendForm.tsx
│   │   ├── send/ShareCard.tsx
│   │   ├── claim/ClaimForm.tsx
│   │   ├── claim/CashOutMock.tsx
│   │   ├── fee-comparison/FeeRace.tsx   ← the killer animation
│   │   └── ui/*                          shadcn primitives
│   ├── lib/
│   │   ├── anchor-client.ts              ⬜ typed program client
│   │   ├── usdc.ts                       ⬜ devnet mint + ATA helpers
│   │   ├── claim-code.ts                 ⬜ 6-digit generator + hash
│   │   ├── pda.ts                        ⬜ deriveTransferPda, deriveEscrowPda
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── useProgram.ts
│   │   ├── useUsdcBalance.ts
│   │   └── useTransfer.ts
│   ├── public/
│   │   ├── manifest.json                 ⬜ PWA manifest
│   │   └── icons/                        ⬜ 192/512 PWA icons
│   └── next.config.ts                    ⬜ wrap with next-pwa
├── tests/remitsol.ts                     ⬜ happy-path test
├── scripts/airdrop-usdc.ts               ⬜ helper to fund a test wallet
├── README.md                             ⬜ rewrite for judges
└── DEMO.md                               ⬜ 3-min video script
```

---

## 9. Milestones

| Day | Goal | Status |
|---|---|---|
| 1 | Env setup + Anchor scaffold | ✅ done |
| 2 | Program written, built, deployed to devnet | ✅ done |
| 3 | Wallet adapter + send flow end-to-end | ⬜ next |
| 4 | Claim flow + mock cash-out + mobile polish | ⬜ |
| 5 | Landing page animation + stats + PWA manifest | ⬜ |
| 6 | Demo video, README, Colosseum submission | ⬜ |

---

## 10. Success Metrics

**Hackathon success (judging):**
- Submission accepted before deadline. ✅ table-stakes.
- Live demo runs end-to-end on a real phone on devnet — sender on one device, recipient on another.
- Fee-race animation is the screenshot judges remember.
- README has GIF in the first paragraph; one-command setup; clear "what's mocked, what's real."

**Product success (post-hackathon):**
- 100 unique wallets initiating a transfer in the first week.
- $10K USDC transferred volume in the first month.
- Median sender-to-recipient time under 10 seconds.
- 1 corridor partner (real off-ramp) signed within 3 months.

---

## 11. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Recipient has no SOL to pay claim tx fee | High | Sender's `create_transfer` should pre-fund recipient with rent-exempt SOL OR program covers fee via fee-payer pattern. (v2.) For v1: hardcoded faucet button on claim page. |
| Recipient has no USDC ATA | High | Frontend creates ATA inside the claim tx. |
| Phantom mobile deeplinking is fiddly | Medium | Test on real iPhone/Android before demo day; have a desktop fallback path. |
| Devnet RPC rate-limits during demo | Medium | Switch to Helius free tier with API key. |
| Judges don't understand devnet vs mainnet | Low | Address explicitly in README and demo video. |
| Claim code collision (two senders pick the same 6 digits) | Low | PDA seeds include `sender` pubkey, so codes are scoped per sender. Encode sender pubkey prefix in the shared link. |

---

## 12. Roadmap (post-hackathon)

- **v1.1** — Real JazzCash / Easypaisa partnership (corridor pilot).
- **v1.2** — Account abstraction / gasless onboarding so recipients don't need SOL.
- **v1.3** — Multi-currency display (PKR, INR, PHP, BDT, NPR).
- **v2.0** — Sender mobile-money on-ramp (load USDC with a Gulf debit card via Stripe or local rails).
- **v2.1** — Group / family wallets — one wallet, multiple recipients on a schedule.
- **v3.0** — Compliance-ready KYC for corridor partners that require it.

---

## 13. Demo Script (3 minutes)

1. **0:00–0:15** — Hook. *"My family in Pakistan loses $1.5 billion in remittance fees every year. Watch me fix that in four seconds."*
2. **0:15–0:45** — Problem. Western Union UI on the left, slow and expensive.
3. **0:45–1:45** — Demo. Two phones side by side. Sender phone: open app, enter $200, sign, claim code appears, share to WhatsApp. Recipient phone: tap link, sign, USDC claimed, mock Easypaisa cash-out.
4. **1:45–2:30** — Why Solana. 400ms blocks, sub-cent fees, USDC native. Show the on-chain tx in Solscan.
5. **2:30–3:00** — Vision and ask. Roadmap slide. *"We'd love to talk to anyone with a JazzCash or Easypaisa relationship."*
