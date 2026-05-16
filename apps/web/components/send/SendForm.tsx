"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCreateTransfer } from "@/hooks/useTransfer";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";
import { generateClaimCode } from "@/lib/claim-code";
import {
  PKR_PER_USD,
  REMITSOL_FEE_USD,
  WESTERN_UNION_FEE_USD,
} from "@/lib/constants";
import { formatPkr } from "@/lib/utils";
import { ShareCard } from "./ShareCard";
import { ArrowRight } from "lucide-react";

const QUICK = [50, 100, 200, 500];

export function SendForm() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const { balance, refresh } = useUsdcBalance();
  const createTransfer = useCreateTransfer();

  const [amount, setAmount] = useState<string>("200");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<null | {
    code: string;
    amount: number;
    signature: string;
  }>(null);

  const numeric = useMemo(() => Number(amount) || 0, [amount]);
  const insufficient = balance !== null && numeric > balance;
  const tooSmall = numeric > 0 && numeric < 0.01;
  const saved = Math.max(0, WESTERN_UNION_FEE_USD - REMITSOL_FEE_USD);

  async function onSend() {
    if (!connected || !publicKey) return;
    if (!numeric || numeric <= 0) {
      toast.error("Enter an amount to send");
      return;
    }
    if (insufficient) {
      toast.error("You don't have enough devnet USDC");
      return;
    }
    setSending(true);
    const code = generateClaimCode();
    try {
      const { signature } = await createTransfer(code, numeric);
      toast.success("Transfer created", {
        description: `Signature ${signature.slice(0, 8)}…`,
      });
      setResult({ code, amount: numeric, signature });
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      toast.error("Transfer failed", { description: msg });
    } finally {
      setSending(false);
    }
  }

  if (result && publicKey) {
    return (
      <ShareCard
        amount={result.amount}
        code={result.code}
        signature={result.signature}
        senderPubkey={publicKey.toBase58()}
        onAnother={() => {
          setResult(null);
          setAmount("200");
        }}
        onTrack={() => router.push("/stats")}
      />
    );
  }

  return (
    <div className="rounded-(--radius-card) bg-(--color-bg-elevated) border border-(--color-border) shadow-[var(--shadow-soft)] p-6 sm:p-8">
      <h2 className="font-[family-name:var(--font-display)] font-bold text-xl">
        How much are you sending?
      </h2>
      <p className="mt-1 text-sm text-(--color-text-muted)">
        Enter the USDC amount. Your recipient will be able to claim it within seconds.
      </p>

      <div className="mt-6 relative">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-(--color-text-muted) font-semibold">
          $
        </span>
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9.]/g, "");
            setAmount(v);
          }}
          className="w-full h-20 pl-12 pr-5 rounded-2xl border border-(--color-border) bg-(--color-bg) text-4xl sm:text-5xl font-[family-name:var(--font-display)] font-extrabold tabular focus:outline-none focus:border-(--color-primary)/40 focus:ring-4 focus:ring-(--color-primary)/10"
          placeholder="0.00"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK.map((v) => (
            <button
              key={v}
              onClick={() => setAmount(String(v))}
              className="h-9 px-4 rounded-full bg-(--color-primary-50) text-(--color-primary) text-sm font-semibold hover:bg-(--color-primary)/15"
              type="button"
            >
              ${v}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Row label="Recipient receives" value={formatPkr(numeric * PKR_PER_USD)} highlight />
        <Row label="Network fee" value={`~$${REMITSOL_FEE_USD.toFixed(4)}`} />
        <Row label="Vs. Western Union" value={`save $${saved.toFixed(2)}`} highlight />
        <Row label="Time to claim" value="~4 seconds" />
      </div>

      <div className="mt-6 text-xs text-(--color-text-muted)">
        Your USDC balance:{" "}
        <span className="tabular font-semibold text-(--color-text)">
          {balance === null ? "—" : balance.toFixed(2)}
        </span>{" "}
        USDC
      </div>

      <div className="mt-6">
        <Button
          size="xl"
          className="w-full"
          disabled={!connected || sending || !numeric || insufficient || tooSmall}
          loading={sending}
          onClick={onSend}
        >
          {!connected
            ? "Connect a wallet to continue"
            : insufficient
            ? "Insufficient devnet USDC"
            : sending
            ? "Sending…"
            : "Generate claim code"}
          {!sending && connected && !insufficient ? <ArrowRight className="w-5 h-5" /> : null}
        </Button>
        {!connected ? (
          <p className="mt-3 text-xs text-center text-(--color-text-muted)">
            Use the &quot;Select Wallet&quot; button in the top-right corner.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl bg-(--color-bg) border border-(--color-border) px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-(--color-text-muted) font-semibold">
        {label}
      </div>
      <div
        className={`mt-1 font-semibold tabular ${
          highlight ? "text-(--color-primary)" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
