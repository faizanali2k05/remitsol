"use client";

import { motion, useAnimationFrame } from "framer-motion";
import { useRef, useState } from "react";
import {
  REMITSOL_FEE_USD,
  REMITSOL_SETTLE_SECONDS,
  WESTERN_UNION_FEE_USD,
  WESTERN_UNION_SETTLE_SECONDS,
} from "@/lib/constants";

// Animates two competing counters that both "race" to settle $200.
// RemitSol finishes in 4s, WU stays at "still pending" for the 2 days
// it would actually take, but we compress to ~30s of loop for the demo.
const LOOP_SECONDS = 30;
const TRANSFER_USD = 200;

export function FeeRace() {
  const ref = useRef<HTMLDivElement>(null);
  const startedAt = useRef<number | null>(null);
  const [t, setT] = useState(0);

  useAnimationFrame((time) => {
    if (startedAt.current === null) startedAt.current = time;
    const elapsed = (time - startedAt.current) / 1000;
    if (elapsed > LOOP_SECONDS) startedAt.current = time;
    setT(Math.min(elapsed, LOOP_SECONDS));
  });

  // RemitSol settles in REMITSOL_SETTLE_SECONDS (4s real time).
  const rsProgress = Math.min(t / REMITSOL_SETTLE_SECONDS, 1);
  // WU compressed: never finishes during the loop — only crawls to ~5%.
  const wuProgress = Math.min(t / (LOOP_SECONDS * 4), 0.18);

  const rsFee = REMITSOL_FEE_USD * rsProgress;
  const wuFee = WESTERN_UNION_FEE_USD * Math.min(t / 3, 1);

  return (
    <div
      ref={ref}
      className="rounded-(--radius-card) overflow-hidden border border-(--color-border) bg-(--color-bg-elevated) shadow-[var(--shadow-soft)]"
    >
      <div className="grid grid-cols-2 divide-x divide-(--color-border)">
        {/* Western Union side */}
        <div className="p-5 sm:p-8 bg-[#FFF9DB] relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-widest text-(--color-wu-text)/70 font-semibold">
            <span className="w-2 h-2 rounded-full bg-(--color-wu)" />
            Western Union
          </div>
          <div className="text-sm text-(--color-wu-text)/70 mb-1">Fee on ${TRANSFER_USD}</div>
          <div className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-extrabold tabular text-(--color-wu-text)">
            ${wuFee.toFixed(2)}
          </div>
          <div className="mt-6 text-sm text-(--color-wu-text)/70">Settles in</div>
          <div className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold tabular text-(--color-wu-text)">
            ~{formatWuTime(WESTERN_UNION_SETTLE_SECONDS)}
          </div>

          <ProgressBar value={wuProgress} accent="#F0A500" label="Pending…" />
        </div>

        {/* RemitSol side */}
        <div className="p-5 sm:p-8 bg-(--color-primary)/[0.04] relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-widest text-(--color-primary) font-semibold">
            <span className="w-2 h-2 rounded-full bg-(--color-primary)" />
            RemitSol
          </div>
          <div className="text-sm text-(--color-text-muted) mb-1">Fee on ${TRANSFER_USD}</div>
          <div className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-extrabold tabular text-(--color-primary)">
            ${rsFee.toFixed(4)}
          </div>
          <div className="mt-6 text-sm text-(--color-text-muted)">Settles in</div>
          <div className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold tabular text-(--color-primary)">
            {(REMITSOL_SETTLE_SECONDS * rsProgress).toFixed(1)}s
          </div>

          <ProgressBar value={rsProgress} accent="var(--color-primary)" label={rsProgress >= 1 ? "Settled ✓" : "Sending…"} />

          {rsProgress >= 1 ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -bottom-2 -right-2 text-[10rem] leading-none select-none text-(--color-primary)/10 font-black"
              aria-hidden
            >
              ✓
            </motion.div>
          ) : null}
        </div>
      </div>

      <div className="px-5 sm:px-8 py-4 border-t border-(--color-border) bg-(--color-bg-elevated) text-sm text-(--color-text-muted) flex items-center justify-between">
        <span>You save</span>
        <span className="font-[family-name:var(--font-display)] font-extrabold text-(--color-primary) tabular text-xl">
          ${(WESTERN_UNION_FEE_USD - REMITSOL_FEE_USD).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function ProgressBar({ value, accent, label }: { value: number; accent: string; label: string }) {
  return (
    <div className="mt-5">
      <div className="h-1.5 rounded-full bg-black/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-100"
          style={{ width: `${value * 100}%`, background: accent }}
        />
      </div>
      <div className="mt-2 text-xs text-(--color-text-muted)">{label}</div>
    </div>
  );
}

function formatWuTime(seconds: number) {
  const days = Math.floor(seconds / 86400);
  return `${days} day${days === 1 ? "" : "s"}`;
}
