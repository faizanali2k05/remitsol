"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";
import { useWallet } from "@solana/wallet-adapter-react";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (m) => m.WalletMultiButton,
    ),
  { ssr: false },
);

export function Header() {
  const { publicKey } = useWallet();
  const { balance } = useUsdcBalance();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-(--color-bg)/85 border-b border-(--color-border)">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo className="h-8 w-8" />
          <span className="font-[family-name:var(--font-display)] font-extrabold text-lg tracking-tight">
            RemitSol
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1 text-sm text-(--color-text-muted)">
          <Link href="/send" className="px-3 py-2 rounded-full hover:bg-(--color-primary-50) hover:text-(--color-text)">
            Send
          </Link>
          <Link href="/stats" className="px-3 py-2 rounded-full hover:bg-(--color-primary-50) hover:text-(--color-text)">
            Stats
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {publicKey && balance !== null ? (
            <div className="hidden sm:flex items-center gap-1.5 h-10 px-3 rounded-full bg-(--color-bg-elevated) border border-(--color-border) text-sm font-semibold tabular">
              <span className="text-(--color-text-muted)">USDC</span>
              <span>{balance.toFixed(2)}</span>
            </div>
          ) : null}
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="rs-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F7A4F" />
          <stop offset="100%" stopColor="#2DBE7E" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#rs-g)" />
      <path
        d="M11 24 L19 13 L23 19 L29 12"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="29" cy="12" r="2.2" fill="#F5D547" />
    </svg>
  );
}
