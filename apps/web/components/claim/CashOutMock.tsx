"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatPkr } from "@/lib/utils";
import { PKR_PER_USD } from "@/lib/constants";
import { CheckCircle2, Smartphone } from "lucide-react";

type Provider = "easypaisa" | "jazzcash";

export function CashOutMock({ amount }: { amount: number }) {
  const [provider, setProvider] = useState<Provider>("easypaisa");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"input" | "confirming" | "done">("input");

  const pkr = amount * PKR_PER_USD;

  async function onConfirm() {
    if (!/^\+?92\d{10}$|^03\d{9}$/.test(phone.replace(/\s/g, ""))) {
      return;
    }
    setStep("confirming");
    await new Promise((r) => setTimeout(r, 1600));
    setStep("done");
  }

  if (step === "done") {
    return (
      <div className="rounded-(--radius-card) bg-(--color-bg-elevated) border border-(--color-border) shadow-[var(--shadow-soft)] p-6 sm:p-8 text-center">
        <CheckCircle2 className="w-12 h-12 mx-auto text-(--color-primary)" />
        <h3 className="mt-4 font-[family-name:var(--font-display)] font-extrabold text-2xl">
          {formatPkr(pkr)} sent
        </h3>
        <p className="mt-1 text-sm text-(--color-text-muted)">
          to {phone} via {provider === "easypaisa" ? "Easypaisa" : "JazzCash"}.
        </p>
        <p className="mt-4 text-xs italic text-(--color-text-muted)">
          Cash-out is mocked in this demo. Real PKR off-ramp is on our roadmap.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-(--radius-card) bg-(--color-bg-elevated) border border-(--color-border) shadow-[var(--shadow-soft)] p-6 sm:p-8">
      <h3 className="font-[family-name:var(--font-display)] font-bold text-xl">
        Cash out to mobile money
      </h3>
      <p className="mt-1 text-sm text-(--color-text-muted)">
        Convert USDC straight to PKR on your phone. (Demo flow — no real transfer.)
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <ProviderTile
          active={provider === "easypaisa"}
          onClick={() => setProvider("easypaisa")}
          name="Easypaisa"
          color="#1FA547"
        />
        <ProviderTile
          active={provider === "jazzcash"}
          onClick={() => setProvider("jazzcash")}
          name="JazzCash"
          color="#E2231A"
        />
      </div>

      <label className="block mt-5 text-xs font-semibold uppercase tracking-widest text-(--color-text-muted)">
        Mobile number
      </label>
      <div className="mt-2 flex items-center h-12 rounded-xl border border-(--color-border) bg-(--color-bg) px-3 focus-within:border-(--color-primary)/40 focus-within:ring-4 focus-within:ring-(--color-primary)/10">
        <Smartphone className="w-4 h-4 text-(--color-text-muted) mr-2" />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+92 3xx xxx xxxx"
          className="flex-1 bg-transparent focus:outline-none text-sm font-mono"
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Row label="You receive" value={formatPkr(pkr)} highlight />
        <Row label="Rate" value={`1 USDC = ${PKR_PER_USD} PKR`} />
      </div>

      <div className="mt-6">
        <Button
          size="xl"
          className="w-full"
          loading={step === "confirming"}
          onClick={onConfirm}
        >
          {step === "confirming" ? "Sending PKR…" : "Send PKR to my phone"}
        </Button>
      </div>
    </div>
  );
}

function ProviderTile({
  active,
  onClick,
  name,
  color,
}: {
  active: boolean;
  onClick: () => void;
  name: string;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`rounded-xl border px-4 py-3 text-left transition-colors ${
        active
          ? "border-(--color-primary) bg-(--color-primary-50)"
          : "border-(--color-border) bg-(--color-bg) hover:bg-(--color-primary-50)/50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: color }}
        />
        <span className="font-semibold">{name}</span>
      </div>
      <div className="text-xs text-(--color-text-muted) mt-0.5">
        Instant mobile wallet
      </div>
    </button>
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
