"use client";

import { ChevronDown, Zap } from "lucide-react";
import { useState } from "react";

/**
 * Charges patronales moyennes (+45% du brut salarié).
 * Permet de calculer le Superbrut (coût total employeur).
 */
const CHARGES_PATRONALES_RATE = 0.45;

/**
 * Taux URSSAF Auto-entrepreneur — prestations de services (BIC).
 * Taux 2025 : 21,2 %. On retient 21,2 % pour la précision.
 */
const URSSAF_AE_RATE = 0.212;

/** Statuts pour lesquels la comparaison n'a pas de sens */
const EXCLUDED_STATUSES = new Set(["AUTO_ENTREPRENEUR"]);

interface FreelanceComparatorProps {
  mensuelBrut: number;
  /** Net salarié après prélèvement à la source */
  mensuelNetCDI: number;
  status: string;
  /** Taux PAS (0-50) appliqué aux deux scénarios pour une comparaison équitable */
  taxRate: number;
}

const fmt = (n: number): string =>
  n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

export function FreelanceComparator({
  mensuelBrut,
  mensuelNetCDI,
  status,
  taxRate,
}: FreelanceComparatorProps) {
  const [open, setOpen] = useState(false);

  // Pas de sens si l'utilisateur est déjà auto-entrepreneur
  if (EXCLUDED_STATUSES.has(status) || mensuelBrut <= 0) return null;

  /**
   * Calcul :
   * 1. Superbrut = brut × 1,45 (coût total employeur)
   * 2. CA de l'AE = Superbrut (il facture l'équivalent du budget employeur)
   * 3. Net AE avant IR = CA × (1 − 21,2 %) — après cotisations URSSAF
   * 4. Net AE après IR = net AE avant IR × (1 − taux PAS) — même taux que CDI
   *
   * Les deux valeurs sont désormais comparées après prélèvement à la source
   * pour une comparaison équitable.
   */
  const superBrut = mensuelBrut * (1 + CHARGES_PATRONALES_RATE);
  const netAEAvantIR = superBrut * (1 - URSSAF_AE_RATE);
  const netAE = netAEAvantIR * (1 - taxRate / 100);

  // Comparaison : net AE après PAS vs net CDI après PAS
  const diff = netAE - mensuelNetCDI;
  const isPositive = diff >= 0;
  const diffPct = mensuelNetCDI > 0 ? (diff / mensuelNetCDI) * 100 : 0;

  return (
    <div className="border-t border-white/20 mt-4 pt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors w-full text-left"
      >
        <Zap className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-[11px] font-semibold">
          Voir l&apos;équivalent en Freelance
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 ml-auto transition-transform duration-200 flex-shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          <div className="rounded-xl bg-white/10 p-3 space-y-2">
            <p className="text-xs text-white/90 leading-snug">
              Pour le même budget employeur de{" "}
              <span className="font-bold">{fmt(superBrut)}</span>, vous
              toucheriez <span className="font-bold">{fmt(netAE)}</span> net en
              Auto-entreprise{" "}
              <span className="text-white/60">
                (après {taxRate.toFixed(1)} % PAS)
              </span>
              .
            </p>

            {mensuelNetCDI > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <span className="text-[11px] text-white/60">
                  vs votre net CDI après PAS :
                </span>
                <span
                  className={`text-[11px] font-bold ${
                    isPositive ? "text-green-200" : "text-red-300"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {fmt(diff)}/mois ({isPositive ? "+" : ""}
                  {diffPct.toFixed(1)} %)
                </span>
              </div>
            )}
          </div>

          <p className="text-[10px] text-white/55 px-1 leading-relaxed">
            Superbrut = brut × 1,45 · Net AE avant PAS = Superbrut × (1 − 21,2
            %) · Les deux nets déduisent le même taux PAS.
          </p>
        </div>
      )}
    </div>
  );
}
