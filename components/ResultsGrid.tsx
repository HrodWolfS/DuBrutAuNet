"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type Output } from "@/lib/convert";

interface ResultsGridProps {
  results: Output;
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

export function ResultsGrid({ results }: ResultsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Brut</CardTitle>
          <CardDescription>Montants avant charges</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span>Horaire</span>
            <span className="font-mono">
              {formatAmount(results.brut.hourly)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span>Journalier</span>
            <span className="font-mono">
              {formatAmount(results.brut.daily)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span>Mensuel</span>
            <span className="font-mono">
              {formatAmount(results.brut.monthly)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span>Annuel</span>
            <span className="font-mono">
              {formatAmount(results.brut.yearly)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Net</CardTitle>
          <CardDescription>Montants après charges</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span>Horaire</span>
            <span className="font-mono">
              {formatAmount(results.net.hourly)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span>Journalier</span>
            <span className="font-mono">{formatAmount(results.net.daily)}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span>Mensuel</span>
            <span className="font-mono">
              {formatAmount(results.net.monthly)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span>Annuel</span>
            <span className="font-mono">
              {formatAmount(results.net.yearly)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
