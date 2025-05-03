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

  // Gérer la saisie dans n'importe quel champ
  const handleInputChange = (
    value: string,
    field: "hourly" | "monthly" | "yearly",
    type: "brut" | "net"
  ) => {
    const cleanValue = value.replace(/[^\d.,]/g, "").replace(/,/g, ".");
    if (cleanValue) {
      handleValueChange(cleanValue, field, type);
    }
  };

  // Remplace formatNumber par une version qui gère le fixed(0) pour mensuel/annuel
  const formatNumberSmart = (
    value: number | string,
    fieldId: string
  ): string => {
    if (activeField === fieldId) return value.toString();
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return "0";
    // Champs mensuel/annuel = pas de décimale
    if (
      ["monthly-brut", "yearly-brut", "monthly-net", "yearly-net"].includes(
        fieldId
      )
    ) {
      return numValue.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
    }
    // Horaire = 2 décimales
    return numValue.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Synchroniser workPercent avec UI
  useEffect(() => {
    form.setValue("hoursPerWeek", Math.round((35 * workPercent) / 100));
  }, [workPercent, form]);

  return (
    <div
      className="w-full mx-auto px-2 sm:px-4"
      style={{ perspective: "1000px" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10 max-w-7xl mx-auto items-stretch">
        {/* Colonne gauche */}
        <div className="flex flex-col gap-4 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10 h-full items-stretch">
          {/* Carte Salaires Brut et Net */}
          <Card
            className="bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl shadow-md border-none p-2 sm:p-3 overflow-hidden relative pb-2"
            style={{
              boxShadow:
                "var(--shadow-lg), inset 2px 2px 10px 2px rgba(255, 255, 255, 0.1)",
            }}
          >
            <CardHeader className="pb-1">
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)] bg-clip-text text-transparent">
                Salaires Brut et Net
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-2 sm:space-y-4">
                  <h3 className="font-semibold text-sm sm:text-base">
                    Salaire Brut
                  </h3>
                  <div className="h-[72px] sm:h-auto flex flex-col justify-end">
                    <Label htmlFor="hourly-brut" className="text-xs mb-1">
                      Horaire brut
                    </Label>
                    <Input
                      id="hourly-brut"
                      type="text"
                      inputMode="decimal"
                      className="
                      text-right
                      bg-gradient-to-br from-[var(--muted)] to-[var(--card)]
                      rounded-2xl
                      px-3 sm:px-6 py-2 sm:py-3
                      text-sm sm:text-base font-medium
                      placeholder:text-[var(--muted-foreground)]
                      shadow-inner
                      shadow-[inset_2px_2px_5px_rgba(0,0,0,0.18),inset_-2px_-2px_5px_rgba(255,255,255,0.08)]
                      focus-visible:ring-2 focus-visible:ring-[var(--primary)] ring-offset-0
                    "
                      style={{
                        boxShadow:
                          "inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.1)",
                      }}
                      value={formatNumberSmart(
                        values.brut.hourly,
                        "hourly-brut"
                      )}
                      onChange={(e) =>
                        handleInputChange(e.target.value, "hourly", "brut")
                      }
                      onFocus={() => setActiveField("hourly-brut")}
                      onBlur={() => setActiveField(null)}
                    />
                  </div>
                  <div className="relative h-[72px] sm:h-auto flex flex-col justify-end">
                    <Label htmlFor="monthly-brut" className="text-xs mb-1">
                      Mensuel brut
                    </Label>
                    <Input
                      id="monthly-brut"
                      type="text"
                      inputMode="decimal"
                      className="
                      text-right
                      bg-gradient-to-br from-[var(--muted)] to-[var(--card)]
                      rounded-2xl
                      px-3 sm:px-6 py-2 sm:py-3
                      text-sm sm:text-base font-medium
                      placeholder:text-[var(--muted-foreground)]
                      shadow-inner
                      shadow-[inset_2px_2px_5px_rgba(0,0,0,0.18),inset_-2px_-2px_5px_rgba(255,255,255,0.08)]
                      focus-visible:ring-2 focus-visible:ring-[var(--primary)] ring-offset-0
                    "
                      style={{
                        boxShadow:
                          "inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.1)",
                      }}
                      value={formatNumberSmart(
                        values.brut.monthly,
                        "monthly-brut"
                      )}
                      onChange={(e) =>
                        handleInputChange(e.target.value, "monthly", "brut")
                      }
                      onFocus={() => setActiveField("monthly-brut")}
                      onBlur={() => setActiveField(null)}
                    />
                  </div>
                  <div className="h-[72px] sm:h-auto flex flex-col justify-end">
                    <Label htmlFor="yearly-brut" className="text-xs mb-1">
                      Annuel brut
                    </Label>
                    <Input
                      id="yearly-brut"
                      type="text"
                      inputMode="decimal"
                      className="
                      text-right
                      bg-gradient-to-br from-[var(--muted)] to-[var(--card)]
                      rounded-2xl
                      px-3 sm:px-6 py-2 sm:py-3
                      text-sm sm:text-base font-medium
                      placeholder:text-[var(--muted-foreground)]
                      shadow-inner
                      shadow-[inset_2px_2px_5px_rgba(0,0,0,0.18),inset_-2px_-2px_5px_rgba(255,255,255,0.08)]
                      focus-visible:ring-2 focus-visible:ring-[var(--primary)] ring-offset-0
                    "
                      style={{
                        boxShadow:
                          "inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.1)",
                      }}
                      value={formatNumberSmart(
                        values.brut.yearly,
                        "yearly-brut"
                      )}
                      onChange={(e) =>
                        handleInputChange(e.target.value, "yearly", "brut")
                      }
                      onFocus={() => setActiveField("yearly-brut")}
                      onBlur={() => setActiveField(null)}
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-4">
                  <h3 className="font-semibold text-sm sm:text-base">
                    Salaire Net
                  </h3>
                  <div className="h-[72px] sm:h-auto flex flex-col justify-end">
                    <Label htmlFor="hourly-net" className="text-xs mb-1">
                      Horaire net
                    </Label>
                    <Input
                      id="hourly-net"
                      type="text"
                      inputMode="decimal"
                      className="
                      text-right
                      bg-gradient-to-br from-[var(--muted)] to-[var(--card)]
                      rounded-2xl
                      px-3 sm:px-6 py-2 sm:py-3
                      text-sm sm:text-base font-medium
                      placeholder:text-[var(--muted-foreground)]
                      focus-visible:ring-2 focus-visible:ring-[var(--primary)] ring-offset-0"
                      style={{
                        boxShadow:
                          "inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.1)",
                      }}
                      value={formatNumberSmart(values.net.hourly, "hourly-net")}
                      onChange={(e) =>
                        handleInputChange(e.target.value, "hourly", "net")
                      }
                      onFocus={() => setActiveField("hourly-net")}
                      onBlur={() => setActiveField(null)}
                    />
                  </div>
                  <div className="h-[72px] sm:h-auto flex flex-col justify-end">
                    <Label htmlFor="monthly-net" className="text-xs mb-1">
                      Mensuel net
                    </Label>
                    <Input
                      id="monthly-net"
                      type="text"
                      inputMode="decimal"
                      className="
                      text-right
                      bg-gradient-to-br from-[var(--muted)] to-[var(--card)]
                      rounded-2xl
                      px-3 sm:px-6 py-2 sm:py-3
                      text-sm sm:text-base font-medium
                      placeholder:text-[var(--muted-foreground)]
                      shadow-inner
                      shadow-[inset_2px_2px_5px_rgba(0,0,0,0.18),inset_-2px_-2px_5px_rgba(255,255,255,0.08)]
                      focus-visible:ring-2 focus-visible:ring-[var(--primary)] ring-offset-0
                    "
                      style={{
                        boxShadow:
                          "inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.1)",
                      }}
                      value={formatNumberSmart(
                        values.net.monthly,
                        "monthly-net"
                      )}
                      onChange={(e) =>
                        handleInputChange(e.target.value, "monthly", "net")
                      }
                      onFocus={() => setActiveField("monthly-net")}
                      onBlur={() => setActiveField(null)}
                    />
                  </div>
                  <div className="h-[72px] sm:h-auto flex flex-col justify-end">
                    <Label htmlFor="yearly-net" className="text-xs mb-1">
                      Annuel net
                    </Label>
                    <Input
                      id="yearly-net"
                      type="text"
                      inputMode="decimal"
                      className="
                      text-right
                      bg-gradient-to-br from-[var(--muted)] to-[var(--card)]
                      rounded-2xl
                      px-3 sm:px-6 py-2 sm:py-3
                      text-sm sm:text-base font-medium
                      placeholder:text-[var(--muted-foreground)]
                      shadow-inner
                      shadow-[inset_2px_2px_5px_rgba(0,0,0,0.18),inset_-2px_-2px_5px_rgba(255,255,255,0.08)]
                      focus-visible:ring-2 focus-visible:ring-[var(--primary)] ring-offset-0
                    "
                      style={{
                        boxShadow:
                          "inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.1)",
                      }}
                      value={formatNumberSmart(values.net.yearly, "yearly-net")}
                      onChange={(e) =>
                        handleInputChange(e.target.value, "yearly", "net")
                      }
                      onFocus={() => setActiveField("yearly-net")}
                      onBlur={() => setActiveField(null)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* gap-6 entre toutes les Cards */}
          {/* Carte Paramètres (Statut + Prime annuelle) */}
          <Card
            className="flex-1 rounded-3xl shadow-md border-none overflow-hidden relative p-2 sm:p-3 pb-2"
            style={{
              boxShadow:
                "var(--shadow-lg), inset 2px 2px 10px 2px rgba(255, 255, 255, 0.1)",
            }}
          >
            <CardHeader className="">
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)] bg-clip-text text-transparent">
                Paramètres
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Section Statut et Prime */}
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-sm sm:text-base">Statut</h3>
                <RadioGroup
                  defaultValue="NON_CADRE"
                  className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4"
                  onValueChange={(e) => setStatus(e as StatusType)}
                >
                  {[
                    "NON_CADRE",
                    "CADRE",
                    "FONCTION_PUBLIQUE",
                    "PROFESSION_LIBERALE",
                    "AUTO_ENTREPRENEUR",
                    "PORTAGE_SALARIAL",
                  ].map((statusValue) => (
                    <div
                      key={statusValue}
                      className="flex items-center space-x-2 bg-gradient-to-br from-[var(--muted)] to-[var(--card)] p-2 md:p-3 rounded-2xl"
                      style={{
                        boxShadow:
                          "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.05)",
                      }}
                    >
                      <RadioGroupItem
                        value={statusValue}
                        id={statusValue}
                        className="text-primary"
                      />
                      <Label
                        htmlFor={statusValue}
                        title={statusValue.replace("_", " ").toLowerCase()}
                        className="text-xs font-medium capitalize truncate cursor-pointer"
                      >
                        {statusValue.replace("_", " ").toLowerCase()}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <div>
                  <Label
                    htmlFor="prime"
                    className="font-semibold text-base mb-2 block"
                  >
                    Prime annuelle
                    <span className="hidden sm:inline"> (€)</span>
                  </Label>
                  <Input
                    id="prime"
                    type="text"
                    inputMode="decimal"
                    className="
                      text-right
                      bg-gradient-to-br from-[var(--muted)] to-[var(--card)]
                      rounded-2xl
                      px-3 sm:px-6 py-2 sm:py-3
                      text-sm sm:text-base font-medium
                      placeholder:text-[var(--muted-foreground)]
                      focus-visible:ring-2 focus-visible:ring-[var(--primary)] ring-offset-0"
                    style={{
                      boxShadow:
                        "inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.1)",
                    }}
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
              </div>
            </CardContent>
          </Card>
          {/* gap-6 entre toutes les Cards */}
        </div>
        {/* Colonne droite */}
        <div className="flex flex-col gap-4 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10">
          {/* Carte Temps de travail et impôts */}
          <Card
            className="rounded-3xl shadow-md border-none overflow-hidden relative p-2 sm:p-3 pb-2"
            style={{
              boxShadow:
                "var(--shadow-lg), inset 2px 2px 10px 2px rgba(255, 255, 255, 0.1)",
            }}
          >
            <CardHeader className="pb-1">
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)] bg-clip-text text-transparent">
                Temps de travail et impôts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Section Temps de travail */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs">Temps de travail</Label>
                  <span className="font-medium">
                    {Math.round((hoursPerWeek / 35) * 100)}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={48}
                  step={1}
                  defaultValue={[35]}
                  value={[hoursPerWeek]}
                  onValueChange={(values) => {
                    const h = values[0];
                    form.setValue("hoursPerWeek", h);
                    setWorkPercent((h / 35) * 100);
                  }}
                  className="mt-2"
                  style={{ height: "8px" }}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {hoursPerWeek} heures/semaine
                </div>
              </div>

              {/* Section Impôt */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs">
                    Taux prélèvement à la source
                  </Label>
                  <span className="font-medium">{taxRate.toFixed(1)}%</span>
                </div>
                <Slider
                  defaultValue={[0]}
                  max={50}
                  step={0.5}
                  value={[taxRate]}
                  onValueChange={(values) => setTaxRate(values[0])}
                  className="mt-2"
                  style={{ height: "8px" }}
                />
              </div>
            </CardContent>
          </Card>
          {/* Carte Résultat */}
          <Card
            id="result-card"
            className="rounded-3xl shadow-md border-none overflow-hidden relative p-1 sm:p-2 pb-2"
            style={{
              boxShadow:
                "var(--shadow-lg), inset 2px 2px 10px 2px rgba(255, 255, 255, 0.1)",
            }}
          >
            <CardHeader className="flex items-center space-x-2 pb-1">
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)] bg-clip-text text-transparent">
                Résultat
              </CardTitle>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground cursor-pointer" />
                </HoverCardTrigger>
                <HoverCardContent className="max-w-xs text-xs sm:text-sm">
                  Les résultats sont des estimations rapides et indicatives :
                  ils ne prennent pas en compte toutes les particularités
                  (conventions collectives, exonérations, secteur
                  d&apos;activité, etc.) et les salaires moyens sont généraux.
                </HoverCardContent>
              </HoverCard>
            </CardHeader>

            <CardContent>
              {/* Intégration de ChargeBreakdown */}
              {values.rawBrut.monthly > 0 && (
                <div>
                  <ChargeBreakdown
                    status={status}
                    brutAmount={values.rawBrut.monthly}
                    taxRate={taxRate}
                    annualNetWithPrime={annualNetWithPrime}
                  />
                </div>
              )}
              <div className="px-4 py-2 flex justify-end">
                <PdfExporter />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
