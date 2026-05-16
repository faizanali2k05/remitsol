import { Suspense } from "react";
import { ClaimForm } from "@/components/claim/ClaimForm";

export const metadata = {
  title: "Claim — RemitSol",
};

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return (
    <div className="flex-1 mx-auto w-full max-w-xl px-5 sm:px-8 py-10 sm:py-16">
      <h1 className="font-[family-name:var(--font-display)] font-extrabold text-3xl sm:text-4xl tracking-tight">
        Welcome — your money is waiting
      </h1>
      <p className="mt-2 text-(--color-text-muted)">
        Connect your wallet, enter your code, and tap claim. It takes about 4 seconds.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div className="text-(--color-text-muted)">Loading…</div>}>
          <ClaimForm code={code} />
        </Suspense>
      </div>
    </div>
  );
}
