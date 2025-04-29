"use client";

import { Card } from "@/components/ui/card";
import { type Input as SalaryInput } from "@/lib/convert";

const CHARGES_LABELS = {
  NON_CADRE: {
    title: "Charges salariales (Non-cadre)",
    items: [
      { label: "Assurance vieillesse plafonnée", rate: 0.069 },
      { label: "Assurance vieillesse déplafonnée", rate: 0.004 },
      { label: "Retraite complémentaire tranche 1", rate: 0.0315 },
      { label: "CEG tranche 1", rate: 0.0086 },
      { label: "CSG/CRDS", rate: 0.097 },
    ],
  },
  CADRE: {
    title: "Charges salariales (Cadre)",
    items: [
      { label: "Assurance vieillesse plafonnée", rate: 0.069 },
      { label: "Assurance vieillesse déplafonnée", rate: 0.004 },
      { label: "Retraite complémentaire tranche 1", rate: 0.0315 },
      { label: "CEG tranche 1", rate: 0.0086 },
      { label: "Cotisation APEC", rate: 0.00024 },
      { label: "CSG/CRDS", rate: 0.097 },
    ],
  },
  FONCTION_PUBLIQUE: {
    title: "Charges salariales (Fonction Publique)",
    items: [
      { label: "Pension civile", rate: 0.11 },
      { label: "CSG/CRDS", rate: 0.097 },
    ],
  },
  PORTAGE_SALARIAL: {
    title: "Charges salariales (Portage)",
    items: [
      { label: "Assurance vieillesse plafonnée", rate: 0.069 },
      { label: "Assurance vieillesse déplafonnée", rate: 0.004 },
      { label: "Retraite complémentaire tranche 1", rate: 0.0315 },
      { label: "CEG tranche 1", rate: 0.0086 },
      { label: "CSG/CRDS", rate: 0.097 },
    ],
  },
  AUTO_ENTREPRENEUR: {
    title: "Charges (Auto-Entrepreneur)",
    items: [{ label: "Cotisations sociales", rate: 0.212 }],
  },
  PROFESSION_LIBERALE: {
    title: "Charges (Profession Libérale)",
    items: [
      { label: "Retraite de base", rate: 0.1787 },
      { label: "Retraite complémentaire", rate: 0.081 },
      { label: "CSG/CRDS", rate: 0.097 },
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
  const { title, items } = CHARGES_LABELS[status];
  if (!brutAmount || isNaN(brutAmount)) {
    return (
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-center text-muted-foreground">—</div>
      </Card>
    );
  }
  const totalCharges = items.reduce((acc, { rate }) => acc + rate, 0);
  const totalChargesAmount = brutAmount * totalCharges;
  const taxAmount = (brutAmount - totalChargesAmount) * (taxRate / 100);
  const netAmount = brutAmount - totalChargesAmount - taxAmount;

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="space-y-2">
        {items.map(({ label, rate }) => (
          <div key={label} className="flex justify-between text-sm">
            <span>{label}</span>
            <div className="flex gap-4">
              <span className="text-muted-foreground">
                {(rate * 100).toFixed(1)}%
              </span>
              <span>
                {(brutAmount * rate).toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}
              </span>
            </div>
          </div>
        ))}
        <div className="flex justify-between text-sm pt-2 border-t">
          <span>Total charges sociales</span>
          <div className="flex gap-4">
            <span className="text-muted-foreground">
              {(totalCharges * 100).toFixed(1)}%
            </span>
            <span>
              {totalChargesAmount.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
              })}
            </span>
          </div>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t">
          <span>Impôt sur le revenu</span>
          <div className="flex gap-4">
            <span className="text-muted-foreground">{taxRate}%</span>
            <span>
              {taxAmount.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
              })}
            </span>
          </div>
        </div>
        <div className="flex justify-between font-semibold pt-2 border-t">
          <span>Net après impôt</span>
          <span>
            {netAmount.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </span>
        </div>
        {annualNetWithPrime !== undefined && annualNetWithPrime !== "" && (
          <div className="flex justify-between font-semibold pt-2">
            <span>Net annuel après impôt</span>
            <span>
              {Number(annualNetWithPrime).toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
              })}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
