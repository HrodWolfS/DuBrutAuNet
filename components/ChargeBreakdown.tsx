"use client";

import { Card } from "@/components/ui/card";
import { type Input as SalaryInput } from "@/lib/convert";

const CHARGES_LABELS = {
  CDI: {
    title: "Charges salariales (CDI)",
    items: [
      { label: "Assurance maladie", rate: 0.07 },
      { label: "Assurance vieillesse", rate: 0.075 },
      { label: "Assurance chômage", rate: 0.024 },
      { label: "Retraite complémentaire", rate: 0.04 },
      { label: "CSG/CRDS", rate: 0.098 },
    ],
  },
  CDD: {
    title: "Charges salariales (CDD)",
    items: [
      { label: "Assurance maladie", rate: 0.07 },
      { label: "Assurance vieillesse", rate: 0.075 },
      { label: "Assurance chômage", rate: 0.024 },
      { label: "Retraite complémentaire", rate: 0.04 },
      { label: "CSG/CRDS", rate: 0.098 },
    ],
  },
  FONCTION_PUBLIQUE: {
    title: "Charges salariales (Fonction Publique)",
    items: [
      { label: "Pension civile", rate: 0.11 },
      { label: "CSG/CRDS", rate: 0.098 },
    ],
  },
  ALTERNANCE: {
    title: "Charges salariales (Alternance)",
    items: [
      { label: "Assurance maladie", rate: 0.07 },
      { label: "CSG/CRDS", rate: 0.098 },
    ],
  },
  AUTO_ENTREPRENEUR: {
    title: "Charges (Auto-Entrepreneur)",
    items: [{ label: "Cotisations sociales", rate: 0.22 }],
  },
} as const;

interface Props {
  status: SalaryInput["status"];
  brutAmount: number;
  taxRate: number;
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

function formatPercentage(amount: number, total: number): string {
  return ((amount / total) * 100).toFixed(1) + "%";
}

export function ChargeBreakdown({ status, brutAmount, taxRate }: Props) {
  const { title, items } = CHARGES_LABELS[status];
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
      </div>
    </Card>
  );
}
