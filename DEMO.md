# RemitSol — 3-minute Demo Script

> Use this as the voice-over while you record. Two phones side by side
> (or a phone + screen recording in a window) make the visuals work.

---

## 0:00 — 0:15  · Hook

> "Last year my country received thirty billion dollars in remittances —
> and lost one and a half billion of it to Western Union–style fees.
> I'm going to send two hundred dollars home in four seconds. Watch."

**B-roll:** the RemitSol landing page, the fee-race animation looping
under the headline.

---

## 0:15 — 0:35  · Problem

> "Here's what my mother sees today. Western Union: fourteen dollars in
> fees, two days to settle, a branch she has to physically go to.
> The people most hurt by remittance fees are exactly the people who
> can least afford them."

**B-roll:** static screenshot of WU fee calculator or the left half of
the FeeRace card.

---

## 0:35 — 1:45  · The Demo

**Phone A — Dubai sender:**

1. Open `remitsol.app` on Phantom mobile.
2. Tap **Send Money Home**.
3. Tap **$200** quick-pick. Recipient receives line shows ≈ PKR 56,000.
4. Tap **Generate claim code** → sign in Phantom.
5. Show the six big digits filling in. Tap **Share to WhatsApp**.

> "The funds are now locked in an on-chain escrow account. Only someone
> with the claim code can release them."

**Phone B — Sahiwal recipient:**

6. Switch to WhatsApp. Tap the RemitSol link.
7. Connect Phantom on devnet.
8. Tap **Claim funds** → sign.
9. Success screen: "$200 USDC claimed in 3.8 seconds. Fee: $0.0004."
10. Tap **Cash out to Easypaisa**, enter a phone number, confirm.
    "PKR 56,000 sent to +92 3xx xxx xxxx."

> "Total time from send to cash out, on two real phones, around 25 seconds.
> Total fee, less than a fraction of a cent."

---

## 1:45 — 2:30  · Why Solana

> "This works because Solana confirms blocks every four hundred
> milliseconds and charges fractions of a cent per transaction.
> Here's the actual on-chain transaction on Solana Explorer."

**B-roll:** click "View on Solana Explorer" from the success screen,
zoom into the program invocation.

> "The escrow is a Program Derived Address — a Solana primitive that
> lets a program own funds without a private key. The recipient
> releases them by proving they know the claim code; the program
> hashes it on-chain and matches against the original hash. No
> middleman, no custodial risk."

---

## 2:30 — 3:00  · Vision & Ask

> "Today this runs on devnet with a mock cash-out screen. Next: we
> sign one corridor partner in Pakistan — JazzCash or Easypaisa — and
> we ship to mainnet. Long-term, the same code works for India,
> the Philippines, Bangladesh — any corridor where workers are
> losing five percent to legacy rails."
>
> "If you have a relationship with a mobile-money provider or you
> work in compliance for one, talk to me after. Thank you."

---

## Recording checklist

- [ ] Two phones, both in Phantom on devnet
- [ ] Sender phone: pre-fund with at least 1 SOL + 1000 mock USDC
- [ ] Recipient phone: at least 0.05 SOL (for the claim tx fee + ATA rent)
- [ ] Screen-record both phones (iOS: Control Center; Android: Quick Settings)
- [ ] Voice memo for the audio; sync in post
- [ ] Final cut: 16:9, < 100MB, hosted as unlisted on YouTube or Loom
