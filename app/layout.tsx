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
  title: "Du Brut au Net — Simulateur Salaire Brut/Net",
  description:
    "Simulateur de conversion salaire brut/net, SMIC, cotisations, impôt, statuts (CDI, CDD, fonction publique, auto-entrepreneur) — 100% gratuit, sans inscription.",
  openGraph: {
    title: "Du Brut au Net — Simulateur Salaire Brut/Net",
    description:
      "Simulateur de conversion salaire brut/net, SMIC, cotisations, impôt, statuts (CDI, CDD, fonction publique, auto-entrepreneur) — 100% gratuit, sans inscription.",
    url: "https://dubrutaunet.fr",
    siteName: "Du Brut au Net",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Logo Du Brut au Net",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Du Brut au Net — Simulateur Salaire Brut/Net",
    description:
      "Simulateur de conversion salaire brut/net, SMIC, cotisations, impôt, statuts (CDI, CDD, fonction publique, auto-entrepreneur) — 100% gratuit, sans inscription.",
    images: ["/android-chrome-512x512.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#1e293b" />
        <meta name="msapplication-TileColor" content="#1e293b" />
        <meta name="theme-color" content="#1e293b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* SEO meta tags */}
        <meta
          name="description"
          content="Simulateur de conversion salaire brut/net, SMIC, cotisations, impôt, statuts (CDI, CDD, fonction publique, auto-entrepreneur) — 100% gratuit, sans inscription."
        />
        <meta
          property="og:title"
          content="Du Brut au Net — Simulateur Salaire Brut/Net"
        />
        <meta
          property="og:description"
          content="Simulateur de conversion salaire brut/net, SMIC, cotisations, impôt, statuts (CDI, CDD, fonction publique, auto-entrepreneur) — 100% gratuit, sans inscription."
        />
        <meta property="og:image" content="/android-chrome-512x512.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dubrutaunet.fr" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Du Brut au Net — Simulateur Salaire Brut/Net"
        />
        <meta
          name="twitter:description"
          content="Simulateur de conversion salaire brut/net, SMIC, cotisations, impôt, statuts (CDI, CDD, fonction publique, auto-entrepreneur) — 100% gratuit, sans inscription."
        />
        <meta name="twitter:image" content="/android-chrome-512x512.png" />
      </head>
      <body className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="sticky top-0 z-50 w-full bg-background/80 border-b border-border flex items-center justify-between px-6 py-3 backdrop-blur">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-foreground hover:text-primary transition-colors"
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
        <main className="flex-1 flex items-start justify-center">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
