"use client";

import { ChevronDown, Zap } from "lucide-react";
import { useState } from "react";

/** Charges patronales estimées (+45% du brut salarié) */
const CHARGES_PATRONALES_RATE = 0.45;

/** Taux URSSAF Auto-entrepreneur (prestations de services) */
const URSSAF_AE_RATE = 0.211;

interface FreelanceComparatorProps {
  mensuelBrut: number;
  mensuelNetCDI: number;
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
}: FreelanceComparatorProps) {
  const [open, setOpen] = useState(false);

  if (mensuelBrut <= 0) return null;

  const superBrut = mensuelBrut * (1 + CHARGES_PATRONALES_RATE);
  const netAE = superBrut * (1 - URSSAF_AE_RATE);
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
              Auto-entreprise.
            </p>

            {mensuelNetCDI > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <span className="text-[11px] text-white/60">
                  vs votre CDI :
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

          <p className="text-[9px] text-white/30 px-1 leading-relaxed">
            Superbrut = brut × 1,45 · Net AE = Superbrut × (1 − 21,1 %)
          </p>
        </div>
      )}
    </div>
  );
}
