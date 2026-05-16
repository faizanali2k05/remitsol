"use client";

import { useMemo, useState } from "react";
import QRCodeImport from "react-qr-code";
// react-qr-code ships a class component whose typing breaks under React 19's
// stricter JSX types. Runtime is fine — we re-cast to a functional component.
const QRCode = QRCodeImport as unknown as React.FC<{
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
}>;
import { Check, Copy, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPkr, shortAddress } from "@/lib/utils";
import { PKR_PER_USD } from "@/lib/constants";
import { toast } from "sonner";

export function ShareCard({
  code,
  amount,
  signature,
  senderPubkey,
  onAnother,
  onTrack,
}: {
  code: string;
  amount: number;
  signature: string;
  senderPubkey: string;
  onAnother: () => void;
  onTrack: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const claimUrl = useMemo(() => {
    if (typeof window === "undefined") return `/claim/${code}?s=${senderPubkey}`;
    return `${window.location.origin}/claim/${code}?s=${senderPubkey}`;
  }, [code, senderPubkey]);

  const waText = useMemo(
    () =>
      `You just received $${amount.toFixed(2)} via RemitSol 🌙\n\n` +
      `Tap to claim:\n${claimUrl}\n\n` +
      `Your claim code: ${code}`,
    [amount, claimUrl, code],
  );

  function copyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied");
    setTimeout(() => setCopied(false), 1500);
  }

  function shareWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(waText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          title: "RemitSol",
          text: waText,
          url: claimUrl,
        });
      } catch {
        // ignore
      }
    } else {
      shareWhatsApp();
    }
  }

  return (
    <div className="rounded-(--radius-card) bg-(--color-bg-elevated) border border-(--color-border) shadow-[var(--shadow-soft)] p-6 sm:p-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 h-8 px-3 rounded-full bg-(--color-primary)/10 text-(--color-primary) text-xs font-semibold">
          <Check className="w-3.5 h-3.5" />
          Funds locked in escrow
        </div>
        <h2 className="mt-4 font-[family-name:var(--font-display)] font-extrabold text-2xl">
          Share the claim code
        </h2>
        <p className="mt-1 text-sm text-(--color-text-muted)">
          Your recipient enters this 6-digit code to claim{" "}
          <span className="font-semibold text-(--color-text) tabular">
            ${amount.toFixed(2)} USDC
          </span>{" "}
          (≈ {formatPkr(amount * PKR_PER_USD)}).
        </p>
      </div>

      <div className="mt-7 mx-auto w-fit">
        <div className="flex gap-2 sm:gap-3 font-[family-name:var(--font-display)] font-extrabold text-3xl sm:text-5xl tabular">
          {code.split("").map((d, i) => (
            <span
              key={i}
              className="w-12 sm:w-16 h-16 sm:h-20 flex items-center justify-center rounded-2xl bg-(--color-primary)/[0.06] border border-(--color-primary)/15 text-(--color-primary)"
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        <Button size="md" variant="secondary" onClick={copyCode}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied" : "Copy code"}
        </Button>
        <Button size="md" onClick={shareWhatsApp}>
          <Share2 className="w-4 h-4" />
          Share to WhatsApp
        </Button>
        <button
          onClick={nativeShare}
          aria-label="Share via system"
          className="h-11 w-11 rounded-full border border-(--color-border) bg-(--color-bg-elevated) hover:bg-(--color-primary-50) flex items-center justify-center"
        >
          <Share2 className="w-4 h-4 text-(--color-text-muted)" />
        </button>
      </div>

      <div className="mt-8 grid sm:grid-cols-[auto_1fr] gap-6 items-center">
        <div className="mx-auto bg-white p-3 rounded-xl border border-(--color-border)">
          <QRCode value={claimUrl} size={132} bgColor="#ffffff" fgColor="#0A1F17" />
        </div>
        <div className="text-sm text-(--color-text-muted)">
          <div className="text-(--color-text) font-semibold">Or scan the QR</div>
          <div className="mt-1 break-all text-xs">{claimUrl}</div>
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-(--color-primary) font-semibold hover:underline"
          >
            View tx on Solana Explorer <ExternalLink className="w-3 h-3" />
          </a>
          <div className="mt-1 text-xs">
            from {shortAddress(senderPubkey)}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 justify-center">
        <Button variant="ghost" onClick={onAnother}>
          Send another
        </Button>
        <Button variant="ghost" onClick={onTrack}>
          See community stats
        </Button>
      </div>
    </div>
  );
}
