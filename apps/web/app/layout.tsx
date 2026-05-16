import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "RemitSol — Send money home in 4 seconds",
  description:
    "Stablecoin remittance from the Gulf to Pakistan & India, in 4 seconds, for fractions of a cent. Built on Solana.",
  applicationName: "RemitSol",
  appleWebApp: {
    capable: true,
    title: "RemitSol",
    statusBarStyle: "default",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "RemitSol — Send money home in 4 seconds",
    description:
      "USDC remittance on Solana. No bank, no branch, no waiting. Mobile-first.",
    url: "https://remitsol.vercel.app",
    siteName: "RemitSol",
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F7A4F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-(--color-bg) text-(--color-text) antialiased">
        <Providers>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
