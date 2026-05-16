"use client";

import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { Check, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCancelTransfer, useMyTransfers } from "@/hooks/useTransfer";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";
import { shortAddress } from "@/lib/utils";

export function MyTransfers() {
  const { rows, loading, refresh } = useMyTransfers();
  const cancel = useCancelTransfer();
  const { refresh: refreshBalance } = useUsdcBalance();
  const [cancelling, setCancelling] = useState<string | null>(null);

  async function onCancel(pda: string) {
    setCancelling(pda);
    try {
      const { signature } = await cancel(new PublicKey(pda));
      toast.success("Cancelled — funds returned to your wallet", {
        description: `Signature ${signature.slice(0, 8)}…`,
      });
      await refresh();
      await refreshBalance();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Cancel failed";
      toast.error("Cancel failed", { description: msg });
    } finally {
      setCancelling(null);
    }
  }

  if (!rows.length && !loading) return null;

  return (
    <div className="rounded-(--radius-card) bg-(--color-bg-elevated) border border-(--color-border) shadow-[var(--shadow-soft)] p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] font-bold text-lg">
          Your recent transfers
        </h2>
        <button
          onClick={refresh}
          className="text-xs text-(--color-text-muted) hover:text-(--color-primary) inline-flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <ul className="mt-4 divide-y divide-(--color-border)">
        {loading ? (
          <li className="py-4 text-sm text-(--color-text-muted)">Loading…</li>
        ) : null}
        {rows.map((r) => (
          <li key={r.pda} className="py-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold tabular">${r.amount.toFixed(2)} USDC</div>
              <div className="text-xs text-(--color-text-muted) tabular">
                {new Date(r.createdAt * 1000).toLocaleString()} ·{" "}
                <span className="font-mono">{shortAddress(r.pda)}</span>
              </div>
            </div>
            {r.claimed ? (
              <span className="inline-flex items-center gap-1 text-(--color-primary) text-xs font-semibold">
                <Check className="w-3.5 h-3.5" />
                Claimed
              </span>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                loading={cancelling === r.pda}
                onClick={() => onCancel(r.pda)}
              >
                <XCircle className="w-4 h-4" />
                Cancel & refund
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
