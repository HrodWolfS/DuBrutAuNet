import { ThemeToggle } from "@/components/ThemeToggle";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ReactNode } from "react";
import { Footer } from "./footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Du Brut au Net | Simulateur de salaire français",
  description:
    "Calculez votre salaire brut en net ou net en brut en fonction de votre statut (non-cadre, cadre, fonction publique, auto-entrepreneur).",
  keywords:
    "calculateur salaire, brut en net, net en brut, salaire français, SMIC, cotisations sociales, simulateur salaire",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="sticky top-0 z-50 w-full bg-background/80 border-b border-border flex items-center justify-between px-6 py-3 backdrop-blur">
          <Link
            href="/"
            className="text-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)] bg-clip-text text-transparent font-bold tracking-tight"
          >
            Du Brut au Net
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/info"
              className="text-sm hover:text-primary transition-colors"
            >
              À propos
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
