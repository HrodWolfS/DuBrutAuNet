"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { StatusType, useCalculator } from "@/lib/hooks/useCalculator";
import { formSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChargeBreakdown } from "./ChargeBreakdown";
import PdfExporter from "./PdfExporter";

const STATUS_LABELS: Record<string, string> = {
  NON_CADRE: "Non Cadre",
  CADRE: "Cadre",
  FONCTION_PUBLIQUE: "Fonc. Publique",
  PROFESSION_LIBERALE: "Prof. Libérale",
  AUTO_ENTREPRENEUR: "Auto-Entrepreneur",
  PORTAGE_SALARIAL: "Portage Salarial",
};

const MONTHLY_YEARLY = [
  "monthly-brut",
  "yearly-brut",
  "monthly-net",
  "yearly-net",
];

export default function CalculatorForm() {
  const [
    {
      values,
      status,
      taxRate,
      workPercent,
      hoursPerWeek,
      prime,
      annualNetWithPrime,
    },
    { handleValueChange, setStatus, setTaxRate, setWorkPercent, setPrime },
  ] = useCalculator();

  const [activeField, setActiveField] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 11.65,
      unit: "hourly",
      direction: "brut",
      status: "NON_CADRE",
      hoursPerWeek: 35,
    },
  });

  const handleInputChange = (
    value: string,
    field: "hourly" | "monthly" | "yearly",
    type: "brut" | "net",
  ) => {
    const cleanValue = value.replace(/[^\d.,]/g, "").replace(/,/g, ".");
    handleValueChange(cleanValue, field, type);
  };

  const formatNumberSmart = (
    value: number | string,
    fieldId: string,
  ): string => {
    if (activeField === fieldId) {
      // String = raw user input (en train de taper) → afficher tel quel
      if (typeof value === "string") return value;
      // Number = valeur calculée au moment du focus → arrondir proprement
      if (isNaN(value)) return "";
      return MONTHLY_YEARLY.includes(fieldId)
        ? String(Math.round(value))
        : String(Math.round(value * 100) / 100);
    }
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return "0";
    if (MONTHLY_YEARLY.includes(fieldId)) {
      return numValue.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
    }
    return numValue.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    form.setValue("hoursPerWeek", Math.round((35 * workPercent) / 100));
  }, [workPercent, form]);

  const inputCls =
    "text-right bg-background border border-input rounded-lg px-2 sm:px-3 text-sm font-medium tabular-nums text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all duration-150 h-9";

  const brutFields = [
    {
      id: "hourly-brut",
      label: "Horaire",
      value: values.brut.hourly,
      field: "hourly" as const,
    },
    {
      id: "monthly-brut",
      label: "Mensuel",
      value: values.brut.monthly,
      field: "monthly" as const,
    },
    {
      id: "yearly-brut",
      label: "Annuel",
      value: values.brut.yearly,
      field: "yearly" as const,
    },
  ];

  const netFields = [
    {
      id: "hourly-net",
      label: "Horaire",
      value: values.net.hourly,
      field: "hourly" as const,
    },
    {
      id: "monthly-net",
      label: "Mensuel",
      value: values.net.monthly,
      field: "monthly" as const,
    },
    {
      id: "yearly-net",
      label: "Annuel",
      value: values.net.yearly,
      field: "yearly" as const,
    },
  ];

  return (
    <div className="w-full mx-auto px-2 sm:px-4 py-2 sm:py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-6xl mx-auto items-start">
        {/* Colonne gauche */}
        <div className="flex flex-col gap-3">
          {/* Carte Salaires */}
          <Card className="bg-card border border-border rounded-2xl shadow-sm">
            <CardHeader className="pt-4 pb-2 px-4">
              <CardTitle className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                Salaires
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {/* En-têtes */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 inline-block" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Brut
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                  <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                    Net
                  </span>
                </div>

                {/* Champs Brut */}
                <div className="space-y-2">
                  {brutFields.map(({ id, label, value, field }) => (
                    <div key={id}>
                      <Label
                        htmlFor={id}
                        className="text-[10px] text-muted-foreground mb-0.5 block"
                      >
                        {label}
                      </Label>
                      <Input
                        id={id}
                        type="text"
                        inputMode="decimal"
                        className={inputCls}
                        value={formatNumberSmart(value, id)}
                        onChange={(e) =>
                          handleInputChange(e.target.value, field, "brut")
                        }
                        onFocus={() => setActiveField(id)}
                        onBlur={() => setActiveField(null)}
                      />
                    </div>
                  ))}
                </div>

                {/* Champs Net */}
                <div className="space-y-2">
                  {netFields.map(({ id, label, value, field }) => (
                    <div key={id}>
                      <Label
                        htmlFor={id}
                        className="text-[10px] text-muted-foreground mb-0.5 block"
                      >
                        {label}
                      </Label>
                      <Input
                        id={id}
                        type="text"
                        inputMode="decimal"
                        className={inputCls}
                        value={formatNumberSmart(value, id)}
                        onChange={(e) =>
                          handleInputChange(e.target.value, field, "net")
                        }
                        onFocus={() => setActiveField(id)}
                        onBlur={() => setActiveField(null)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte Paramètres */}
          <Card className="bg-card border border-border rounded-2xl shadow-sm flex-1">
            <CardHeader className="pt-4 pb-2 px-4">
              <CardTitle className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                Paramètres
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              {/* Statut */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Statut professionnel
                </p>
                <RadioGroup
                  value={status}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-1.5"
                  onValueChange={(e) => setStatus(e as StatusType)}
                >
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <div key={val} className="relative">
                      <RadioGroupItem
                        value={val}
                        id={val}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={val}
                        className={[
                          "flex items-center justify-center text-center",
                          "rounded-lg border px-1.5 py-1.5 text-[10px] font-medium cursor-pointer",
                          "transition-all duration-150 leading-tight min-h-[32px]",
                          status === val
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
                        ].join(" ")}
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Prime */}
              <div>
                <Label
                  htmlFor="prime"
                  className="text-[10px] text-muted-foreground mb-0.5 block"
                >
                  Prime annuelle (€)
                </Label>
                <Input
                  id="prime"
                  type="text"
                  inputMode="decimal"
                  className={inputCls}
                  value={formatNumberSmart(prime, "prime")}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/[^\d.,]/g, "")
                      .replace(/,/g, ".");
                    setPrime(parseFloat(value) || 0);
                  }}
                  onFocus={() => setActiveField("prime")}
                  onBlur={() => setActiveField(null)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite */}
        <div className="flex flex-col gap-3">
          {/* Carte Temps & Impôts */}
          <Card className="bg-card border border-border rounded-2xl shadow-sm">
            <CardHeader className="pt-4 pb-2 px-4">
              <CardTitle className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                Temps & Impôts
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-foreground font-medium">
                    Temps de travail
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-semibold tabular-nums">
                      {Math.round((hoursPerWeek / 35) * 100)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      · {hoursPerWeek}h/sem.
                    </span>
                  </div>
                </div>
                <Slider
                  min={0}
                  max={48}
                  step={1}
                  defaultValue={[35]}
                  value={[hoursPerWeek]}
                  onValueChange={(vals) => {
                    const h = vals[0];
                    form.setValue("hoursPerWeek", h);
                    setWorkPercent((h / 35) * 100);
                  }}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-foreground font-medium">
                    Prélèvement à la source
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {taxRate.toFixed(1)}%
                  </span>
                </div>
                <Slider
                  defaultValue={[0]}
                  max={50}
                  step={0.5}
                  value={[taxRate]}
                  onValueChange={(vals) => setTaxRate(vals[0])}
                />
              </div>
            </CardContent>
          </Card>

          {/* Carte Résultat */}
          <Card
            id="result-card"
            className="bg-card border border-border rounded-2xl shadow-sm"
          >
            <CardHeader className="pt-4 pb-2 px-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                  Résultat
                </CardTitle>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                  </HoverCardTrigger>
                  <HoverCardContent className="max-w-xs text-xs leading-relaxed">
                    Estimations indicatives — ne prennent pas en compte
                    conventions collectives, exonérations ou particularités
                    sectorielles.
                  </HoverCardContent>
                </HoverCard>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {values.rawBrut.monthly > 0 && (
                <ChargeBreakdown
                  status={status}
                  brutAmount={values.rawBrut.monthly}
                  taxRate={taxRate}
                  annualNetWithPrime={annualNetWithPrime}
                />
              )}
              <div className="pt-3 flex justify-end">
                <PdfExporter />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
