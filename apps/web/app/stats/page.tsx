"use client";

import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import {
  REMITSOL_FEE_USD,
  TOTAL_FEES_SAVED_USD_BASE,
  WESTERN_UNION_FEE_USD,
} from "@/lib/constants";

type Row = {
  day: string;
  rs: number;
  wu: number;
};

const data: Row[] = Array.from({ length: 14 }, (_, i) => {
  const base = 800 + Math.sin(i / 2) * 220 + i * 60;
  return {
    day: `D${i + 1}`,
    rs: Math.round(base * (REMITSOL_FEE_USD / WESTERN_UNION_FEE_USD) * 1000) / 1000,
    wu: Math.round(base),
  };
});

const TOP_SENDERS = [
  { name: "Ali (Dubai → Karachi)", saved: 312.5 },
  { name: "Hina (Riyadh → Lahore)", saved: 245.0 },
  { name: "Bilal (Doha → Sahiwal)", saved: 198.75 },
  { name: "Sara (Sharjah → Multan)", saved: 174.0 },
  { name: "Usman (Muscat → Faisalabad)", saved: 142.25 },
];

export default function StatsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-16">
      <p className="text-sm uppercase tracking-widest text-(--color-text-muted) font-semibold">
        Community stats
      </p>
      <h1 className="mt-1 font-[family-name:var(--font-display)] font-extrabold text-4xl sm:text-5xl tracking-tight">
        Pakistani families are saving real money.
      </h1>
      <p className="mt-2 text-(--color-text-muted) max-w-2xl">
        These numbers represent simulated activity on devnet. Real on-chain
        aggregation goes live with mainnet at v1.1.
      </p>

      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        <KPI label="Total saved" value={`$${TOTAL_FEES_SAVED_USD_BASE.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} />
        <KPI label="Transfers" value="1,247" />
        <KPI label="Avg. settle time" value="3.9s" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 rounded-(--radius-card) bg-(--color-bg-elevated) border border-(--color-border) shadow-[var(--shadow-soft)] p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-display)] font-bold text-lg">
              Fees per day — Western Union vs RemitSol
            </h2>
            <p className="text-xs text-(--color-text-muted)">Sample $200 transfer volume, last 14 days.</p>
          </div>
        </div>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="wuFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F0A500" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#F0A500" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F7A4F" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0F7A4F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E2D2" />
              <XAxis dataKey="day" stroke="#5B6B63" fontSize={12} />
              <YAxis stroke="#5B6B63" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#FAF7F0",
                  borderRadius: 12,
                  border: "1px solid #E7E2D2",
                }}
                formatter={(v: unknown) => `$${Number(v).toFixed(2)}`}
              />
              <Area type="monotone" dataKey="wu" stroke="#F0A500" fill="url(#wuFill)" strokeWidth={2} name="Western Union" />
              <Area type="monotone" dataKey="rs" stroke="#0F7A4F" fill="url(#rsFill)" strokeWidth={2} name="RemitSol" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="mt-10 rounded-(--radius-card) bg-(--color-bg-elevated) border border-(--color-border) shadow-[var(--shadow-soft)] p-6 sm:p-8">
        <h2 className="font-[family-name:var(--font-display)] font-bold text-lg">
          Top savers this month
        </h2>
        <ul className="mt-4 divide-y divide-(--color-border)">
          {TOP_SENDERS.map((s, i) => (
            <li key={s.name} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-(--color-primary-50) text-(--color-primary) font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <span>{s.name}</span>
              </div>
              <span className="font-[family-name:var(--font-display)] font-bold tabular text-(--color-primary)">
                ${s.saved.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-(--radius-card) bg-(--color-bg-elevated) border border-(--color-border) shadow-[var(--shadow-soft)] p-6">
      <div className="text-xs uppercase tracking-widest text-(--color-text-muted) font-semibold">
        {label}
      </div>
      <div className="mt-1 font-[family-name:var(--font-display)] font-extrabold text-3xl tabular">
        {value}
      </div>
    </div>
  );
}
