"use client";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { StatusType, useCalculator } from "@/lib/hooks/useCalculator";
import { formSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, RotateCcw, SlidersHorizontal, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChargeBreakdown } from "./ChargeBreakdown";
import { FreelanceComparator } from "./FreelanceComparator";
import PdfExporter from "./PdfExporter";
import { SocialPyramid } from "./SocialPyramid";

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

const PanelLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
    {children}
  </p>
);

const SectionTitle = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 mb-5">
    <span className="text-primary">{icon}</span>
    <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">
      {children}
    </span>
  </div>
);

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
      monthlyNetAfterTax,
    },
    {
      handleValueChange,
      handleReset,
      setStatus,
      setTaxRate,
      setWorkPercent,
      setPrime,
    },
  ] = useCalculator();

  const [activeField, setActiveField] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);

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
    const clean = value.replace(/[^\d.,]/g, "").replace(/,/g, ".");
    handleValueChange(clean, field, type);
  };

  const formatNumberSmart = (
    value: number | string,
    fieldId: string,
  ): string => {
    if (activeField === fieldId) {
      if (typeof value === "string") return value;
      if (isNaN(value as number)) return "";
      return MONTHLY_YEARLY.includes(fieldId)
        ? String(Math.round(value as number))
        : String(Math.round((value as number) * 100) / 100);
    }
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "0";
    if (MONTHLY_YEARLY.includes(fieldId))
      return num.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
    return num.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    form.setValue("hoursPerWeek", Math.round((35 * workPercent) / 100));
  }, [workPercent, form]);

  const inputCls =
    "text-right bg-background border border-input rounded-lg px-3 text-sm font-medium tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all duration-150 h-9 w-full";

  const brutFields = [
    {
      id: "hourly-brut",
      label: "Horaire brut",
      value: values.brut.hourly,
      field: "hourly" as const,
    },
    {
      id: "monthly-brut",
      label: "Mensuel brut",
      value: values.brut.monthly,
      field: "monthly" as const,
    },
    {
      id: "yearly-brut",
      label: "Annuel brut",
      value: values.brut.yearly,
      field: "yearly" as const,
    },
  ];

  const netFields = [
    {
      id: "hourly-net",
      label: "Horaire net",
      value: values.net.hourly,
      field: "hourly" as const,
    },
    {
      id: "monthly-net",
      label: "Mensuel net",
      value: values.net.monthly,
      field: "monthly" as const,
    },
    {
      id: "yearly-net",
      label: "Annuel net",
      value: values.net.yearly,
      field: "yearly" as const,
    },
  ];

  const chargesRate =
    values.rawBrut.monthly > 0
      ? ((values.rawBrut.monthly - values.rawNet.monthly) /
          values.rawBrut.monthly) *
        100
      : 0;

  const yearlyNet =
    typeof annualNetWithPrime === "number" ? annualNetWithPrime : 0;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Card globale */}
      <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* ══ Panel 1 : Revenus ══ */}
          <div className="flex-[1.2] p-5 lg:p-6">
            <SectionTitle icon={<TrendingUp className="w-4 h-4" />}>
              Revenus (Brut &amp; Net)
            </SectionTitle>

            <div className="grid grid-cols-2 gap-x-3 gap-y-3">
              {/* Colonne Brut */}
              <div className="space-y-2.5">
                {brutFields.map(({ id, label, value, field }) => (
                  <div key={id}>
                    <PanelLabel>{label}</PanelLabel>
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

              {/* Colonne Net */}
              <div className="space-y-2.5">
                {netFields.map(({ id, label, value, field }) => (
                  <div key={id}>
                    <PanelLabel>
                      <span className="text-primary">{label}</span>
                    </PanelLabel>
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

            {/* Effacer */}
            <button
              onClick={handleReset}
              className="mt-5 w-full flex items-center justify-center gap-2 border border-border rounded-xl py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all duration-150"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Effacer les champs
            </button>
          </div>

          {/* Séparateur vertical */}
          <div className="hidden lg:block w-px bg-border" />
          <div className="block lg:hidden h-px bg-border" />

          {/* ══ Panel 2 : Paramètres ══ */}
          <div className="flex-[1.5] p-5 lg:p-6 bg-muted/40">
            <SectionTitle icon={<SlidersHorizontal className="w-4 h-4" />}>
              Statut &amp; Paramètres
            </SectionTitle>

            {/* Statut */}
            <PanelLabel>Sélectionnez votre statut</PanelLabel>
            <div className="grid grid-cols-3 gap-1.5 mb-5">
              {Object.entries(STATUS_LABELS).map(([val, label]) => {
                const isSelected = status === val;
                return (
                  <button
                    key={val}
                    onClick={() => setStatus(val as StatusType)}
                    className={[
                      "flex flex-col items-center justify-center rounded-xl border p-2.5 gap-1.5 transition-all duration-150 cursor-pointer",
                      isSelected
                        ? "border-primary bg-card shadow-sm"
                        : "border-border bg-background/60 hover:border-primary/40",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30",
                      ].join(" ")}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span
                      className={[
                        "text-[10px] font-medium text-center leading-tight",
                        isSelected ? "text-primary" : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Temps de travail */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <PanelLabel>Temps de travail</PanelLabel>
                <span className="text-[11px] font-bold bg-primary/10 text-primary rounded-full px-2 py-0.5">
                  {Math.round((hoursPerWeek / 35) * 100)} % · {hoursPerWeek}
                  h/sem.
                </span>
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

            {/* Prime annuelle */}
            <div className="mb-4">
              <PanelLabel>Prime annuelle (€)</PanelLabel>
              <Input
                id="prime"
                type="text"
                inputMode="decimal"
                className={inputCls}
                value={formatNumberSmart(prime, "prime")}
                onChange={(e) => {
                  const v = e.target.value
                    .replace(/[^\d.,]/g, "")
                    .replace(/,/g, ".");
                  setPrime(parseFloat(v) || 0);
                }}
                onFocus={() => setActiveField("prime")}
                onBlur={() => setActiveField(null)}
              />
            </div>

            {/* Taux PAS */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <PanelLabel>Prélèvement à la source</PanelLabel>
                <span className="text-[11px] font-bold bg-primary/10 text-primary rounded-full px-2 py-0.5">
                  {taxRate.toFixed(1)} %
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
          </div>

          {/* Séparateur vertical */}
          <div className="hidden lg:block w-px bg-border" />
          <div className="block lg:hidden h-px bg-border" />

          {/* ══ Panel 3 : Résultat (fond vert) ══ */}
          <div className="flex-1 p-5 lg:p-6 bg-primary flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-white/50 animate-pulse flex-shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                Résultat après impôts
              </span>
            </div>

            {/* Net mensuel */}
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-1">
                Mensuel net
              </p>
              <p className="text-4xl font-bold text-white tabular-nums leading-none">
                {monthlyNetAfterTax > 0
                  ? monthlyNetAfterTax.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    })
                  : "—"}
              </p>
            </div>

            {/* Net annuel */}
            <div className="mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-1">
                Annuel net
              </p>
              <p className="text-3xl font-bold text-white tabular-nums leading-none">
                {yearlyNet > 0
                  ? yearlyNet.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    })
                  : "—"}
              </p>
            </div>

            {/* Stats clés */}
            {values.rawBrut.monthly > 0 && (
              <div className="rounded-xl bg-white/10 p-3 mb-4 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/70">Cotisations sociales</span>
                  <span className="font-semibold text-white">
                    {chargesRate.toFixed(1)} %
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/70">Prélèvement à la source</span>
                  <span className="font-semibold text-white">
                    {taxRate.toFixed(1)} %
                  </span>
                </div>
              </div>
            )}

            {/* Voir le détail */}
            {values.rawBrut.monthly > 0 && (
              <button
                onClick={() => setShowDetail((v) => !v)}
                className="text-[11px] text-white/60 hover:text-white/90 underline decoration-dotted transition-colors mb-4 text-left"
              >
                {showDetail
                  ? "Masquer le détail"
                  : "Voir le détail des charges"}
              </button>
            )}

            {/* Détail accordion */}
            {showDetail && values.rawBrut.monthly > 0 && (
              <div className="mb-4 rounded-xl bg-white/10 overflow-hidden">
                <ChargeBreakdown
                  status={status}
                  brutAmount={values.rawBrut.monthly}
                  taxRate={taxRate}
                  annualNetWithPrime={annualNetWithPrime}
                />
              </div>
            )}

            {/* Freelance comparator */}
            <FreelanceComparator
              mensuelBrut={values.rawBrut.monthly}
              mensuelNetCDI={monthlyNetAfterTax}
            />

            {/* Spacer */}
            <div className="flex-1" />

            {/* PDF */}
            <PdfExporter
              buttonText="Télécharger le PDF"
              buttonClassName="w-full flex items-center justify-center gap-2 bg-white text-primary font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-white/90 transition-all duration-150"
            />
          </div>
        </div>
      </div>

      {/* Jauge position salariale — sous la card */}
      <SocialPyramid mensuelNet={monthlyNetAfterTax} />
    </div>
  );
}
