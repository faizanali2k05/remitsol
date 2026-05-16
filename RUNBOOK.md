# RemitSol — Runbook

> Everything you need to take this repo from a fresh clone to a working
> demo on a real phone. Read top-to-bottom — each section depends on the
> previous one.

---

## 0. What you already have

| Layer | State |
|---|---|
| Anchor program | Deployed to **Solana Devnet** at `HhNrDYKVCq9Hx9tgyWVbbtrhFnVxQqWW2iHSqn3RKxTa` |
| Instructions | `create_transfer`, `claim_transfer`, `cancel_transfer` |
| Frontend | Next.js 16 PWA at [remitsol.vercel.app](https://remitsol.vercel.app) |
| Mock USDC | **You will create this in step 3** (one-time, 30 seconds) |

You only need to do steps 1–4 once. After that, `npm run dev` is the loop.

---

## 1. Prerequisites check

In your WSL Ubuntu terminal:

```bash
node --version          # need v20+
rustc --version         # any 1.7x+
solana --version        # need 1.18+ or 2.x
anchor --version        # need 0.29.x
git --version           # any recent
```

If any fail, see the install steps in [remitsol.txt](remitsol.txt) — they got you here.

```bash
# Confirm you're on devnet
solana config set --url https://api.devnet.solana.com
solana airdrop 2
solana balance         # should print >= 2 SOL
```

---

## 2. Helius RPC — your API key

A flaky RPC will kill a live demo. We use [Helius](https://helius.dev)
free tier (1M credits / month).

### Step-by-step (3 minutes, no credit card)

1. Open https://helius.dev in your browser.
2. Top-right → **Get Started Free** → sign in with Google or GitHub.
3. After login you land on the dashboard. Click **+ New Project**.
4. Project name: `remitsol`. Network: **Devnet**. Click **Create Project**.
5. You're now on the project's page. The **RPC URL** at the top looks like:
   ```
   https://devnet.helius-rpc.com/?api-key=01234abc-5678-...
   ```
   Copy the entire URL including the api-key query string.
6. Keep that tab open — you'll paste this into `.env.local` in step 5.

> **Don't share the key publicly.** It's tied to your free quota. If you
> ever commit it by accident, regenerate it from the Helius dashboard
> (Settings → API keys → Rotate).

---

## 3. Mock USDC mint — one-time setup

Real Circle devnet USDC is rate-limited and unreliable. We mint our own
6-decimal SPL token and call it USDC for the demo. Your local Solana
CLI keypair is the mint authority — meaning **you** can airdrop unlimited
mock USDC to anyone (your Phantom, judges, friends) on demand.

```bash
cd /home/faizan/dev/remitsol

# 3a. Create the mock USDC mint (one-time forever).
# TS_NODE_PROJECT points ts-node at scripts/tsconfig.json so it picks up
# Node types — the root tsconfig is set up for Anchor's mocha tests.
TS_NODE_PROJECT=scripts/tsconfig.json npx ts-node scripts/airdrop-usdc.ts init
```

Output looks like:

```
payer: JDCzv4E49N3o2Cs4o3hfUgFfHq76FLHndbnVPD6FWQDg

Mock USDC mint created:
  Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr   ← COPY THIS

→ Put this in apps/web/.env.local:
  NEXT_PUBLIC_USDC_MINT=Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr
```

**Save that mint address.** You'll paste it into `.env.local` next.

> If you ever lose the address, you can recreate the mint, but you'll
> need to airdrop USDC to your Phantom wallet again with the new mint.

---

## 4. Phantom wallet on Devnet

You need **Phantom on devnet** for both the dev experience and the demo.

### Browser (Windows Chrome)

1. https://phantom.app → **Add to Chrome** → install.
2. Pin the Phantom extension (puzzle-piece icon).
3. Click **Create New Wallet** → write down the 12-word seed phrase on paper. **Never type it anywhere except into Phantom itself.**
4. Set a password.
5. Once you're in the wallet, click the **⚙ gear (Settings)** icon →
   **Developer Settings** → enable **Testnet Mode**.
6. Top of Phantom → click the network dropdown → choose **Devnet**.
7. Click your wallet name at the top → **Copy** the address. Save it
   somewhere — you'll need it next.

### Mobile (for the demo video)

Same flow on your phone — Phantom mobile app from the App Store or Play
Store. Repeat steps 3–6 inside the app. This is the wallet your "sender"
phone uses in the demo.

For the **recipient** phone, install Phantom again on a second device
(or reuse a friend's phone). New wallet, new seed. Note the address.

### Airdrop SOL + mock USDC to your Phantom

```bash
# Replace with the Phantom address you copied above
PHANTOM_ADDR=ENTER_YOUR_PHANTOM_DEVNET_ADDRESS_HERE

# Send 2 SOL (free, devnet faucet)
solana airdrop 2 "$PHANTOM_ADDR" --url devnet

# Send 1000 mock USDC (uses the mint you created in step 3)
NEXT_PUBLIC_USDC_MINT=<paste-mint-from-step-3> \
TS_NODE_PROJECT=scripts/tsconfig.json \
  npx ts-node scripts/airdrop-usdc.ts mint "$PHANTOM_ADDR"
```

Open Phantom — you should see **2 SOL** and **1000 USDC** appear within 5 seconds.

Repeat the SOL airdrop (and a small USDC airdrop if you want pre-loaded balance)
for your **recipient** Phantom wallet.

---

## 5. Configure `.env.local`

```bash
cp apps/web/.env.example apps/web/.env.local
```

Open [apps/web/.env.local](apps/web/.env.local) in VS Code and replace
the two placeholders:

```bash
# From step 2 — your Helius URL
NEXT_PUBLIC_RPC=https://devnet.helius-rpc.com/?api-key=YOUR_KEY_FROM_HELIUS

# From step 3 — the mint address printed by `airdrop-usdc.ts init`
NEXT_PUBLIC_USDC_MINT=PASTE_THE_MINT_ADDRESS_HERE
```

> The web app reads these at build time. After editing, you must
> **restart `npm run dev`** if it's already running. Vercel rebuilds
> automatically on push, but only after you set the same vars in the
> Vercel dashboard — see step 8.

---

## 6. Run it locally

```bash
cd /home/faizan/dev/remitsol/apps/web
npm install        # only the first time
npm run dev
```

Open http://localhost:3000. You should see the green landing page with
the fee-race animation looping.

Click **Connect Wallet** in the top right → Phantom → approve.
You should see your USDC balance in the header.

Click **Send Money Home**:
1. Enter $200 (or click the $200 chip).
2. Click **Generate claim code**.
3. Sign in Phantom.
4. After ~4 seconds, the success screen shows a 6-digit code + WhatsApp share button.
5. Below the form, the **Your recent transfers** card shows the transfer with a **Cancel & refund** button. The cancel flow is fully wired — try it once to confirm.

To test the **claim flow** on the same machine:
1. Connect a *different* Phantom wallet (use Phantom's "Add account" feature, or use a separate browser profile).
2. Open the claim URL printed in the share card (or scan the QR with your phone).
3. Enter the 6-digit code, click **Claim funds**, sign.
4. After success, click **Cash out to Easypaisa**, enter any +92 number, confirm.

---

## 7. Run the Anchor test suite (optional but recommended)

```bash
cd /home/faizan/dev/remitsol

# This spins up a local validator, deploys the program to it, and runs
# the mocha test in tests/remitsol.ts (create + claim + cancel happy paths).
anchor test
```

If `anchor test` fails because of the same IDL-extraction bug that
required us to copy the .so manually, you can run the test against the
already-deployed devnet program instead:

```bash
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com \
ANCHOR_WALLET=~/.config/solana/id.json \
  npx ts-mocha -p tsconfig.json -t 1000000 tests/**/*.ts
```

---

## 8. Deploy to Vercel

You already have `remitsol.vercel.app` connected. To make the new env
vars take effect on the live URL:

1. Go to https://vercel.com → click your **remitsol** project.
2. Top tabs → **Settings** → **Environment Variables**.
3. Add two variables (for **Production** and **Preview**):
   - Key: `NEXT_PUBLIC_RPC`  Value: *(your Helius URL from step 2)*
   - Key: `NEXT_PUBLIC_USDC_MINT`  Value: *(your mint address from step 3)*
4. Click **Save**.
5. Top tabs → **Deployments** → click the latest one → **⋯** menu → **Redeploy**.
6. Wait ~60 seconds. Visit `https://remitsol.vercel.app` — your env vars are now live.

> Anyone in the world can now use your deployed app **on a real phone**,
> with their own Phantom wallet on devnet. Hand someone the link and they
> can send themselves mock USDC.

---

## 9. Deploying program changes (when you edit Rust)

If you edit `programs/remitsol/src/lib.rs`:

```bash
cd /home/faizan/dev/remitsol

# Build (5–10 min on first run, faster on incremental)
anchor build

# If the IDL-extraction step fails (known issue with Anchor 0.29 + recent rustc),
# copy the SBF binary manually:
cp target/sbpf-solana-solana/release/remitsol.so target/deploy/remitsol.so

# Deploy the upgrade. Program ID stays the same; only the bytecode changes.
solana program deploy \
  --program-id target/deploy/remitsol-keypair.json \
  target/deploy/remitsol.so \
  --url devnet
```

If you added or changed instructions, also update the handwritten IDL:
- [apps/web/lib/idl/remitsol.json](apps/web/lib/idl/remitsol.json)
- [apps/web/lib/idl/remitsol.ts](apps/web/lib/idl/remitsol.ts)

Then commit + push — Vercel rebuilds.

---

## 10. Common issues

| Symptom | Cause | Fix |
|---|---|---|
| "Wallet not connected" toast on every click | Phantom is on Mainnet | Phantom → Settings → switch to Devnet |
| "Insufficient devnet USDC" | You haven't airdropped mock USDC to this wallet | `npx ts-node scripts/airdrop-usdc.ts mint <YOUR_ADDR>` |
| "TokenAccountNotFoundError" on send | You haven't initialized the USDC ATA on this wallet | The airdrop script creates the ATA — re-run `mint` |
| "Insufficient funds" deploying | CLI keypair is out of devnet SOL | `solana airdrop 2` (retry if rate-limited) |
| Stats page chart looks 0×0 | Hydration timing | Refresh once; Recharts measures container after mount |
| Vercel deploy ignores `.env.local` | `.env.local` is never uploaded | Set the same vars in Vercel **dashboard**, not the file |

---

## 11. Demo day checklist

- [ ] Both phones have Phantom installed, on Devnet, with SOL + USDC
- [ ] Sender phone is logged into a Phantom that holds ≥ $500 mock USDC
- [ ] Recipient phone has ≥ 0.05 SOL (for the claim tx + ATA rent)
- [ ] Open `remitsol.vercel.app` on both phones, "Add to Home Screen"
- [ ] Test full round trip the day before — `send` → `claim` → `cash out`
- [ ] Record demo per [DEMO.md](DEMO.md)
- [ ] Push the final commit to GitHub (judges browse the repo)

---

You're done. Ship it.
