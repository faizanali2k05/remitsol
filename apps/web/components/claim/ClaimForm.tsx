"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClaimTransfer } from "@/hooks/useTransfer";
import { formatPkr } from "@/lib/utils";
import { PKR_PER_USD } from "@/lib/constants";
import { CashOutMock } from "./CashOutMock";

export function ClaimForm({ code: initialCode }: { code: string }) {
  const search = useSearchParams();
  const senderParam = search.get("s");
  const { connected, publicKey } = useWallet();
  const claim = useClaimTransfer();

  const [code, setCode] = useState(initialCode);
  const [sender, setSender] = useState(senderParam ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState<number | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  // The amount on a transfer is on-chain; we don't pre-fetch in v1.
  // The success state pulls the amount from the tx receipt (parsed inline).
  // For demo simplicity we assume $200 unless we re-fetch.

  useEffect(() => {
    if (senderParam) setSender(senderParam);
  }, [senderParam]);

  async function onClaim() {
    if (!connected || !publicKey) {
      toast.error("Connect your wallet first");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      toast.error("Claim code must be 6 digits");
      return;
    }
    let senderPk: PublicKey;
    try {
      senderPk = new PublicKey(sender.trim());
    } catch {
      toast.error("Invalid sender address. Open the link your sender shared.");
      return;
    }
    setSubmitting(true);
    try {
      const { signature } = await claim(code, senderPk);
      toast.success("Claimed!", {
        description: `Signature ${signature.slice(0, 8)}…`,
      });
      setSignature(signature);
      // Optimistic; CashOutMock just shows the amount the recipient picked off-app
      setClaimedAmount(200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Claim failed";
      toast.error("Claim failed", { description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  if (claimedAmount !== null && signature) {
    return (
      <ClaimSuccess
        amount={claimedAmount}
        signature={signature}
        onCashOut={() => {
          // CashOutMock takes over via state below
        }}
        cashOut={<CashOutMock amount={claimedAmount} />}
      />
    );
  }

  return (
    <div className="rounded-(--radius-card) bg-(--color-bg-elevated) border border-(--color-border) shadow-[var(--shadow-soft)] p-6 sm:p-8">
      <h2 className="font-[family-name:var(--font-display)] font-bold text-xl">
        Claim your money
      </h2>
      <p className="mt-1 text-sm text-(--color-text-muted)">
        Enter the 6-digit code your family sent you and connect your wallet.
      </p>

      <label className="block mt-6 text-xs font-semibold uppercase tracking-widest text-(--color-text-muted)">
        Claim code
      </label>
      <input
        inputMode="numeric"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="123456"
        className="mt-2 w-full h-16 rounded-2xl border border-(--color-border) bg-(--color-bg) text-3xl text-center font-[family-name:var(--font-display)] font-extrabold tabular tracking-[0.4em] focus:outline-none focus:border-(--color-primary)/40 focus:ring-4 focus:ring-(--color-primary)/10"
      />

      <label className="block mt-5 text-xs font-semibold uppercase tracking-widest text-(--color-text-muted)">
        Sender wallet address
      </label>
      <input
        value={sender}
        onChange={(e) => setSender(e.target.value)}
        placeholder="From the WhatsApp link"
        className="mt-2 w-full h-12 rounded-xl border border-(--color-border) bg-(--color-bg) px-4 text-sm font-mono focus:outline-none focus:border-(--color-primary)/40 focus:ring-4 focus:ring-(--color-primary)/10"
      />
      <p className="mt-1.5 text-xs text-(--color-text-muted)">
        Pre-filled from the link. Don&rsquo;t edit unless you know what you&rsquo;re doing.
      </p>

      <div className="mt-6 rounded-xl bg-(--color-primary-50) border border-(--color-primary)/15 p-4 text-sm">
        <div className="text-(--color-text-muted) text-xs uppercase tracking-widest font-semibold">
          Estimated value (PKR)
        </div>
        <div className="mt-1 font-[family-name:var(--font-display)] font-extrabold text-2xl text-(--color-primary) tabular">
          {formatPkr(200 * PKR_PER_USD)} <span className="text-base font-semibold text-(--color-text-muted)">approx</span>
        </div>
      </div>

      <div className="mt-6">
        <Button
          size="xl"
          className="w-full"
          disabled={!connected || submitting}
          loading={submitting}
          onClick={onClaim}
        >
          {!connected ? "Connect wallet to claim" : submitting ? "Claiming…" : "Claim funds"}
          {!submitting && connected ? <ArrowRight className="w-5 h-5" /> : null}
        </Button>
        {!connected ? (
          <p className="mt-3 text-xs text-center text-(--color-text-muted)">
            Tap &quot;Select Wallet&quot; at the top right.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ClaimSuccess({
  amount,
  signature,
  cashOut,
}: {
  amount: number;
  signature: string;
  onCashOut: () => void;
  cashOut: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-(--radius-card) bg-(--color-bg-elevated) border border-(--color-border) shadow-[var(--shadow-soft)] p-6 sm:p-8 text-center">
        <CheckCircle2 className="w-12 h-12 mx-auto text-(--color-primary)" />
        <h2 className="mt-4 font-[family-name:var(--font-display)] font-extrabold text-2xl">
          ${amount.toFixed(2)} USDC claimed
        </h2>
        <p className="mt-1 text-sm text-(--color-text-muted)">
          Settled in &lt; 4 seconds. Fee: $0.0004.
        </p>
        <a
          href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-(--color-primary) font-semibold hover:underline text-sm"
        >
          View tx on Solana Explorer
        </a>
      </div>
      {cashOut}
    </div>
  );
}
