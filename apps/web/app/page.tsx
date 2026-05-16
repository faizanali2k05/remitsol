import Link from "next/link";
import { FeeRace } from "@/components/fee-comparison/FeeRace";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe2, Shield, Smartphone, Zap } from "lucide-react";
import {
  REMITSOL_FEE_USD,
  TOTAL_FEES_SAVED_USD_BASE,
  WESTERN_UNION_FEE_USD,
} from "@/lib/constants";

export default function Home() {
  const saved = TOTAL_FEES_SAVED_USD_BASE;

  return (
    <div className="flex-1">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-(--color-primary)/15 blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-(--color-accent)/25 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-12 pb-16 sm:pt-20 sm:pb-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 h-8 px-3 rounded-full bg-(--color-primary-50) text-(--color-primary) text-xs font-semibold border border-(--color-primary)/15">
              <span className="w-1.5 h-1.5 rounded-full bg-(--color-primary)" />
              Live on Solana Devnet
            </div>
            <h1 className="mt-5 font-[family-name:var(--font-display)] font-extrabold text-4xl sm:text-6xl tracking-tight leading-[1.05]">
              Send money home
              <br />
              in <span className="text-(--color-primary)">4 seconds.</span>
            </h1>
            <p className="mt-5 text-lg text-(--color-text-muted) max-w-lg">
              Stablecoin remittance from the Gulf to Pakistan, India, and beyond.
              No bank, no branch, no waiting. Built on Solana — fees under one cent.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/send">
                <Button size="xl" className="group">
                  Send Money Home
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="/stats">
                <Button size="xl" variant="secondary">
                  See community savings
                </Button>
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              <Stat label="WU fee" value={`$${WESTERN_UNION_FEE_USD.toFixed(2)}`} tone="muted" strike />
              <Stat label="RemitSol fee" value={`$${REMITSOL_FEE_USD.toFixed(4)}`} tone="primary" />
              <Stat label="Settles" value="~4s" tone="primary" />
            </dl>
          </div>

          <div>
            <FeeRace />
            <p className="mt-3 text-xs text-(--color-text-muted) text-center">
              Live animation. Demo values shown on a $200 transfer.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-(--color-border) bg-(--color-bg-elevated)">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <Feature
            icon={<Zap className="w-5 h-5" />}
            title="400ms blocks"
            body="Solana confirms in under half a second. Your USDC lands before you put the phone down."
          />
          <Feature
            icon={<Shield className="w-5 h-5" />}
            title="On-chain escrow"
            body="Funds sit in a program-controlled vault until your recipient claims with the code. No middleman."
          />
          <Feature
            icon={<Smartphone className="w-5 h-5" />}
            title="WhatsApp handoff"
            body="One-tap share to the recipient — they don't need an account. The wallet is the account."
          />
          <Feature
            icon={<Globe2 className="w-5 h-5" />}
            title="No bank required"
            body="Cash out to JazzCash / Easypaisa instantly. Built for the workers, not the wires."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24 text-center">
        <p className="text-sm uppercase tracking-widest text-(--color-text-muted) font-semibold">
          Together so far
        </p>
        <p className="mt-3 font-[family-name:var(--font-display)] font-extrabold text-5xl sm:text-7xl tabular text-(--color-primary)">
          $
          {saved.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="mt-3 text-(--color-text-muted) max-w-md mx-auto">
          saved by Pakistani families using RemitSol vs. Western Union fees.
        </p>
        <div className="mt-8">
          <Link href="/stats">
            <Button size="lg" variant="secondary">
              See live stats
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  strike,
}: {
  label: string;
  value: string;
  tone: "muted" | "primary";
  strike?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-(--color-text-muted) font-semibold">
        {label}
      </dt>
      <dd
        className={`mt-1 font-[family-name:var(--font-display)] font-extrabold text-xl sm:text-2xl tabular ${
          tone === "primary" ? "text-(--color-primary)" : "text-(--color-text)"
        } ${strike ? "line-through opacity-60" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="w-10 h-10 rounded-xl bg-(--color-primary-50) text-(--color-primary) flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-4 font-[family-name:var(--font-display)] font-bold text-lg">
        {title}
      </h3>
      <p className="mt-1 text-sm text-(--color-text-muted) leading-relaxed">{body}</p>
    </div>
  );
}
