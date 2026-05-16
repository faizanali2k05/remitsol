import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsd(amount: number, opts: { compact?: boolean } = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount < 1 ? 4 : 2,
    maximumFractionDigits: amount < 1 ? 4 : 2,
    notation: opts.compact ? "compact" : "standard",
  }).format(amount);
}

export function formatPkr(amount: number) {
  return `PKR ${new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

export function shortAddress(addr: string | undefined | null, len = 4) {
  if (!addr) return "";
  return `${addr.slice(0, len)}…${addr.slice(-len)}`;
}
