"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { Card } from "@/components/ui/card";
import {
  effectiveRate,
  employeeRate,
  RATES,
  type StatusType,
} from "@/shared/salary";

const AVERAGE_NET = RATES.averageNet;
const CHARGES_LABELS = RATES.statuses;

interface Props {
  status: StatusType;
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
  const globalRate = employeeRate(status);
  if (!brutAmount || isNaN(brutAmount)) {
    return (
      <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)]">
        <Card className="p-2 sm:p-4 space-y-3 sm:space-y-4 rounded-2xl bg-background border-0">
          <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
          <div className="text-center text-muted-foreground">—</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)]">
      <Card className="p-2 sm:p-4 space-y-3 sm:space-y-4 rounded-2xl bg-background border-0">
        <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="truncate pr-2">Total cotisations sociales</span>
            <div className="flex gap-2 sm:gap-4 flex-shrink-0">
              <span className="text-muted-foreground">
                {(globalRate * 100).toFixed(1)}%
              </span>
              <span>
                {(brutAmount * globalRate).toLocaleString("fr-FR", {
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
                  ((brutAmount - brutAmount * globalRate) * taxRate) /
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
                (brutAmount - brutAmount * globalRate) *
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
                  (((brutAmount - brutAmount * globalRate) *
                    (1 - taxRate / 100)) /
                    brutAmount) *
                  100
                }%`,
              }}
              title={`Net : ${(
                (((brutAmount - brutAmount * globalRate) *
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
                <div className="text-[10px] sm:text-xs text-right text-muted-foreground cursor-help underline decoration-dotted line-clamp-2 sm:line-clamp-none">
                  Votre net représente&nbsp;
                  {(
                    (((brutAmount - brutAmount * globalRate) *
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
        <Accordion type="single" collapsible>
          <AccordionItem value="charges-detail">
            <AccordionTrigger>Détail complet des charges</AccordionTrigger>
            <AccordionContent className="pt-2">
              <ul className="space-y-1 pl-2">
                {CHARGES_LABELS[status].items.map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="truncate pr-2">{item.label}</span>
                    <div className="flex gap-2 sm:gap-4 flex-shrink-0">
                      <span className="text-muted-foreground">
                        {(effectiveRate(item) * 100).toFixed(2)}%
                      </span>
                      <span>
                        {(brutAmount * effectiveRate(item)).toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              {CHARGES_LABELS[status].note && (
                <p className="text-[10px] sm:text-xs text-muted-foreground pt-2 pl-2">
                  {CHARGES_LABELS[status].note}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Projection annuelle avec prime */}
        {annualNetWithPrime !== undefined && annualNetWithPrime !== "" && (
          <div className=" border-t">
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
              (Net mensuel × 12) + Prime × (1 − {(globalRate * 100).toFixed(1)}%
              cotis.) × (1 − {taxRate}% impôt)
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
