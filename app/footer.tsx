import { formatFrenchDate } from "@/shared/legal";
import { RATES } from "@/shared/salary";
import Link from "next/link";

const LINKS = [
  { href: "/info", label: "Méthode & sources" },
  { href: "/support", label: "Support" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/mentions-legales", label: "Mentions légales" },
];

export function Footer() {
  return (
    <footer className="p-3 sm:p-4 border-t border-border mt-auto">
      <div className="relative max-w-7xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Taux mis à jour le : <strong>{formatFrenchDate(RATES.lastUpdate)}</strong>
        </span>
        <span
          className="absolute left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)] bg-clip-text text-transparent font-bold text-center whitespace-nowrap"
          style={{
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          © {RATES.lastUpdate.slice(0, 4)} Du Brut au Net
        </span>
        <span className="text-[10px] sm:text-xs text-right">
          Données fournies à titre indicatif et sans garantie.
        </span>
      </div>
      <nav className="max-w-7xl mx-auto mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:underline">
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
