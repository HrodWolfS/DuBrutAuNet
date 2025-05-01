"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { Card } from "@/components/ui/card";
import { type Input as SalaryInput } from "@/lib/convert";

const AVERAGE_NET: Record<
  keyof typeof CHARGES_LABELS,
  { value: number; source: string }
> = {
  NON_CADRE: {
    value: 1950,
    source: "https://www.insee.fr/fr/statistiques/7457170",
  },
  CADRE: {
    value: 3375,
    source: "https://www.apec.fr/actualites/etudes/salaire-moyen-cadres.html",
  },
  FONCTION_PUBLIQUE: {
    value: 2527,
    source: "https://www.insee.fr/fr/statistiques/2381332",
  },
  PORTAGE_SALARIAL: {
    value: 4000,
    source:
      "https://syndicatportagesalarial.fr/branche/chiffres-portage-salarial/",
  },
  AUTO_ENTREPRENEUR: {
    value: 1650,
    source:
      "https://www.hellowork.com/fr-fr/medias/salaire-auto-entrepreneur.html",
  },
  PROFESSION_LIBERALE: {
    value: 3000,
    source: "https://www.insee.fr/fr/statistiques/4470782?sommaire=4470890",
  },
};

const GLOBAL_RATE: Record<keyof typeof CHARGES_LABELS, number> = {
  NON_CADRE: 0.22,
  CADRE: 0.245,
  PORTAGE_SALARIAL: 0.22,
  FONCTION_PUBLIQUE: 0.167,
  PROFESSION_LIBERALE: 0.3567,
  AUTO_ENTREPRENEUR: 0.212,
};

const CHARGES_LABELS = {
  NON_CADRE: {
    title: "Charges salariales (Non‑cadre)",
    items: [
      { label: "Assurance vieillesse plafonnée", rate: 0.069 },
      { label: "Assurance vieillesse déplafonnée", rate: 0.004 },
      { label: "Retraite complémentaire – Tranche 1", rate: 0.0315 },
      { label: "CEG – Tranche 1", rate: 0.0086 },
      { label: "CET", rate: 0.0014 },
      { label: "CSG déductible", rate: 0.068 },
      { label: "CSG non déductible", rate: 0.024 },
      { label: "CRDS", rate: 0.005 },
    ],
  },
  CADRE: {
    title: "Charges salariales (Cadre)",
    items: [
      { label: "Assurance vieillesse plafonnée", rate: 0.069 },
      { label: "Assurance vieillesse déplafonnée", rate: 0.004 },
      { label: "Retraite complémentaire – Tranche 1", rate: 0.0315 },
      { label: "Retraite complémentaire – Tranche 2", rate: 0.0864 },
      { label: "CEG – Tranche 1", rate: 0.0086 },
      { label: "CEG – Tranche 2", rate: 0.0108 },
      { label: "Cotisation APEC", rate: 0.00024 },
      { label: "CSG déductible", rate: 0.068 },
      { label: "CSG non déductible", rate: 0.024 },
      { label: "CRDS", rate: 0.005 },
    ],
  },
  FONCTION_PUBLIQUE: {
    title: "Charges salariales (Fonction publique)",
    items: [
      { label: "Pension civile (retraite de base)", rate: 0.111 },
      { label: "RAFP (retraite additionnelle)", rate: 0.05 },
      { label: "CSG déductible", rate: 0.068 },
      { label: "CSG non déductible", rate: 0.024 },
      { label: "CRDS", rate: 0.005 },
    ],
  },
  PORTAGE_SALARIAL: {
    title: "Charges salariales (Portage)",
    items: [
      { label: "Assurance vieillesse plafonnée", rate: 0.069 },
      { label: "Assurance vieillesse déplafonnée", rate: 0.004 },
      { label: "Retraite complémentaire – Tranche 1", rate: 0.0315 },
      { label: "CEG – Tranche 1", rate: 0.0086 },
      { label: "CET", rate: 0.0014 },
      { label: "CSG déductible", rate: 0.068 },
      { label: "CSG non déductible", rate: 0.024 },
      { label: "CRDS", rate: 0.005 },
    ],
  },
  AUTO_ENTREPRENEUR: {
    title: "Cotisations (Micro‑entrepreneur)",
    items: [{ label: "Forfait social", rate: 0.212 }],
  },
  PROFESSION_LIBERALE: {
    title: "Cotisations sociales (Prof. libérale)",
    items: [
      { label: "Maladie‑maternité (taux plein)", rate: 0.065 },
      { label: "Indemnités journalières", rate: 0.005 },
      { label: "Allocations familiales", rate: 0.031 },
      { label: "Retraite de base (≤ 1 PASS)", rate: 0.0873 },
      { label: "Retraite complémentaire – Tranche 1", rate: 0.09 },
      { label: "Retraite complémentaire – Tranche 2", rate: 0.22 },
      { label: "Invalidité‑décès", rate: 0.013 },
      { label: "CSG déductible", rate: 0.068 },
      { label: "CSG non déductible", rate: 0.024 },
      { label: "CRDS", rate: 0.005 },
      { label: "CFP", rate: 0.0025 },
    ],
  },
} as const;

interface Props {
  status: SalaryInput["status"];
  brutAmount?: number;
  taxRate: number;
  annualNetWithPrime?: number | "";
}

export function ChargeBreakdown({
  status,
  brutAmount,
  taxRate,
  annualNetWithPrime,
}: Props) {
  const { title } = CHARGES_LABELS[status];
  if (!brutAmount || isNaN(brutAmount)) {
    return (
      <Card className="p-2 sm:p-4 space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
        <div className="text-center text-muted-foreground">—</div>
      </Card>
    );
  }

  return (
    <Card className="p-2 sm:p-4 space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="truncate pr-2">Total cotisations sociales</span>
          <div className="flex gap-2 sm:gap-4 flex-shrink-0">
            <span className="text-muted-foreground">
              {(GLOBAL_RATE[status] * 100).toFixed(1)}%
            </span>
            <span>
              {(brutAmount * GLOBAL_RATE[status]).toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
              })}
            </span>
          </div>
        </div>

        <div className="flex justify-between text-xs sm:text-sm pt-2 border-t">
          <span className="truncate pr-2">Impôt sur le revenu</span>
          <div className="flex gap-2 sm:gap-4 flex-shrink-0">
            <span className="text-muted-foreground">{taxRate}%</span>
            <span>
              {(
                ((brutAmount - brutAmount * GLOBAL_RATE[status]) * taxRate) /
                100
              ).toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
              })}
            </span>
          </div>
        </div>

        <div className="flex justify-between text-xs sm:text-sm font-semibold pt-2 border-t">
          <span className="truncate pr-2">Net après impôt</span>
          <span className="flex-shrink-0">
            {(
              (brutAmount - brutAmount * GLOBAL_RATE[status]) *
              (1 - taxRate / 100)
            ).toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </span>
        </div>

        {/* Barre empilée Net / Brut */}
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{
              width: `${
                (((brutAmount - brutAmount * GLOBAL_RATE[status]) *
                  (1 - taxRate / 100)) /
                  brutAmount) *
                100
              }%`,
            }}
            title={`Net : ${(
              (((brutAmount - brutAmount * GLOBAL_RATE[status]) *
                (1 - taxRate / 100)) /
                brutAmount) *
              100
            ).toFixed(1)} % du brut`}
          />
        </div>

        {/* Comparaison au salaire moyen */}
        {AVERAGE_NET[status] && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="text-[10px] sm:text-xs text-right text-muted-foreground pt-1 cursor-help underline decoration-dotted line-clamp-2 sm:line-clamp-none">
                Votre net représente&nbsp;
                {(
                  (((brutAmount - brutAmount * GLOBAL_RATE[status]) *
                    (1 - taxRate / 100)) /
                    AVERAGE_NET[status].value) *
                  100
                ).toFixed(0)}
                &nbsp;% du net moyen&nbsp;
                {CHARGES_LABELS[status].title
                  .replace(/.*\((.+)\)/, "$1")
                  .toLowerCase()}
                .
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="text-xs sm:text-sm text-left space-y-1">
              <p>
                Le salaire moyen pour un&nbsp;
                {CHARGES_LABELS[status].title
                  .replace(/.*\((.+)\)/, "$1")
                  .toLowerCase()}{" "}
                est de&nbsp;
                {AVERAGE_NET[status].value.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}{" "}
                net.
              </p>
              <p className="text-muted-foreground">
                Source :{" "}
                <a
                  href={AVERAGE_NET[status].source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Voir les données
                </a>
              </p>
            </HoverCardContent>
          </HoverCard>
        )}
      </div>

      {/* Détail complet des charges */}
      <details className="text-xs sm:text-sm">
        <summary className="cursor-pointer p-2 hover:bg-muted rounded-md transition-colors">
          Détail complet des charges
        </summary>
        <ul className="space-y-1 mt-2 pl-2">
          {CHARGES_LABELS[status].items.map((item, i) => (
            <li key={i} className="flex justify-between">
              <span className="truncate pr-2">{item.label}</span>
              <div className="flex gap-2 sm:gap-4 flex-shrink-0">
                <span className="text-muted-foreground">
                  {(item.rate * 100).toFixed(1)}%
                </span>
                <span>
                  {(brutAmount * item.rate).toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </details>

      {/* Projection annuelle avec prime */}
      {annualNetWithPrime !== undefined && annualNetWithPrime !== "" && (
        <div className="pt-2 border-t">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="truncate pr-2">Annuel net (avec prime)</span>
            <span className="font-semibold flex-shrink-0">
              {typeof annualNetWithPrime === "number"
                ? annualNetWithPrime.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })
                : "—"}
            </span>
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground text-right mt-1">
            (Net mensuel × 12) + Prime × (1 − {GLOBAL_RATE[status] * 100}%
            cotis. − {taxRate}% impôt)
          </div>
        </div>
      )}
    </Card>
  );
}
