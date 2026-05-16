import { SendForm } from "@/components/send/SendForm";
import { MyTransfers } from "@/components/send/MyTransfers";

export const metadata = {
  title: "Send — RemitSol",
};

export default function SendPage() {
  return (
    <div className="flex-1 mx-auto w-full max-w-xl px-5 sm:px-8 py-10 sm:py-16 space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] font-extrabold text-3xl sm:text-4xl tracking-tight">
          Send money home
        </h1>
        <p className="mt-2 text-(--color-text-muted)">
          Pay in USDC. Your recipient claims with a 6-digit code shared over WhatsApp.
        </p>
      </div>
      <SendForm />
      <MyTransfers />
    </div>
  );
}
