"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { StatusType, useCalculator } from "@/lib/hooks/useCalculator";
import { formSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

  // Réinitialiser tous les champs
  const resetForm = () => {
    form.reset({
      amount: 11.65,
      unit: "hourly",
      direction: "brut",
      status: "NON_CADRE",
      hoursPerWeek: 35,
    });
    handleValueChange("0", "hourly", "brut");
    setStatus("NON_CADRE");
    setWorkPercent(100);
    setTaxRate(0);
    setPrime(0);
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
  }, [hoursPerWeek, form]);

  return (
    <div className="w-full mx-auto" style={{ perspective: "1000px" }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carte pour les salaires brut et net */}
        <Card
          className="bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl shadow-md border-none p-6 overflow-hidden relative"
          style={{
            boxShadow:
              "var(--shadow-lg), inset 2px 2px 10px 2px rgba(255, 255, 255, 0.1)",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)] bg-clip-text text-transparent">
              Salaires Brut et Net
            </CardTitle>
            <CardDescription className="text-[var(--muted-foreground)]">
              Calculez votre rémunération
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Salaire Brut</h3>
                <div>
                  <Label htmlFor="hourly-brut" className="text-sm">
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
                    px-6 py-3
                    text-lg font-medium
                    placeholder:text-[var(--muted-foreground)]
                    shadow-inner
                    shadow-[inset_2px_2px_5px_rgba(0,0,0,0.18),inset_-2px_-2px_5px_rgba(255,255,255,0.08)]
                    focus-visible:ring-2 focus-visible:ring-[var(--primary)] ring-offset-0
                  "
                    style={{
                      boxShadow:
                        "inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.1)",
                    }}
                    value={formatNumberSmart(values.brut.hourly, "hourly-brut")}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "hourly", "brut")
                    }
                    onFocus={() => setActiveField("hourly-brut")}
                    onBlur={() => setActiveField(null)}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="monthly-brut" className="text-sm">
                      Mensuel brut
                    </Label>
                    {status === "NON_CADRE" && (
                      <span className="text-xs bg-[var(--accent)] text-[var(--accent-foreground)] px-3 py-1 rounded-xl font-medium">
                        Non-cadre -22%
                      </span>
                    )}
                  </div>
                  <Input
                    id="monthly-brut"
                    type="text"
                    inputMode="decimal"
                    className="text-right bg-[var(--muted)] border-none rounded-2xl px-6 py-3 text-lg font-medium placeholder:text-[var(--muted-foreground)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] ring-offset-0"
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
                <div>
                  <Label htmlFor="yearly-brut" className="text-sm">
                    Annuel brut
                  </Label>
                  <Input
                    id="yearly-brut"
                    type="text"
                    inputMode="decimal"
                    className="text-right bg-[var(--muted)] border-none rounded-2xl px-6 py-3 text-lg font-medium placeholder:text-[var(--muted-foreground)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] ring-offset-0"
                    style={{
                      boxShadow:
                        "inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.1)",
                    }}
                    value={formatNumberSmart(values.brut.yearly, "yearly-brut")}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "yearly", "brut")
                    }
                    onFocus={() => setActiveField("yearly-brut")}
                    onBlur={() => setActiveField(null)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Salaire Net</h3>
                <div>
                  <Label htmlFor="hourly-net" className="text-sm">
                    Horaire net
                  </Label>
                  <Input
                    id="hourly-net"
                    type="text"
                    inputMode="decimal"
                    className="text-right bg-[var(--muted)] border-none rounded-2xl px-6 py-3 text-lg font-medium placeholder:text-[var(--muted-foreground)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] ring-offset-0"
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
                <div>
                  <Label htmlFor="monthly-net" className="text-sm">
                    Mensuel net
                  </Label>
                  <Input
                    id="monthly-net"
                    type="text"
                    inputMode="decimal"
                    className="text-right bg-[var(--muted)] border-none rounded-2xl px-6 py-3 text-lg font-medium placeholder:text-[var(--muted-foreground)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] ring-offset-0"
                    style={{
                      boxShadow:
                        "inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.1)",
                    }}
                    value={formatNumberSmart(values.net.monthly, "monthly-net")}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "monthly", "net")
                    }
                    onFocus={() => setActiveField("monthly-net")}
                    onBlur={() => setActiveField(null)}
                  />
                </div>
                <div>
                  <Label htmlFor="yearly-net" className="text-sm">
                    Annuel net
                  </Label>
                  <Input
                    id="yearly-net"
                    type="text"
                    inputMode="decimal"
                    className="text-right bg-[var(--muted)] border-none rounded-2xl px-6 py-3 text-lg font-medium placeholder:text-[var(--muted-foreground)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] ring-offset-0"
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

        {/* Carte pour le statut et prime exceptionnelle*/}
        <Card
          className="rounded-3xl shadow-md border-none overflow-hidden relative"
          style={{
            boxShadow:
              "var(--shadow-lg), inset 2px 2px 10px 2px rgba(255, 255, 255, 0.1)",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)] bg-clip-text text-transparent">
              Statut et Prime Exceptionnelle
            </CardTitle>
            <CardDescription className="text-[var(--muted-foreground)]">
              Sélectionnez votre statut
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              defaultValue="NON_CADRE"
              className="grid grid-cols-3 gap-4 mt-2"
              onValueChange={(e) => setStatus(e as StatusType)}
            >
              <div
                className="flex items-center space-x-2 bg-[var(--muted)] p-3 rounded-2xl"
                style={{
                  boxShadow:
                    "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.05)",
                }}
              >
                <RadioGroupItem
                  value="NON_CADRE"
                  id="NON_CADRE"
                  className="text-primary"
                />
                <Label htmlFor="NON_CADRE" className="text-sm font-medium">
                  Salarié non-cadre
                </Label>
              </div>
              <div
                className="flex items-center space-x-2 bg-[var(--muted)] p-3 rounded-2xl"
                style={{
                  boxShadow:
                    "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.05)",
                }}
              >
                <RadioGroupItem
                  value="CADRE"
                  id="CADRE"
                  className="text-primary"
                />
                <Label htmlFor="CADRE" className="text-sm font-medium">
                  Salarié cadre
                </Label>
              </div>
              <div
                className="flex items-center space-x-2 bg-[var(--muted)] p-3 rounded-2xl"
                style={{
                  boxShadow:
                    "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.05)",
                }}
              >
                <RadioGroupItem
                  value="FONCTION_PUBLIQUE"
                  id="FONCTION_PUBLIQUE"
                  className="text-primary"
                />
                <Label
                  htmlFor="FONCTION_PUBLIQUE"
                  className="text-sm font-medium"
                >
                  Fonction publique
                </Label>
              </div>
              <div
                className="flex items-center space-x-2 bg-[var(--muted)] p-3 rounded-2xl"
                style={{
                  boxShadow:
                    "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.05)",
                }}
              >
                <RadioGroupItem
                  value="PROFESSION_LIBERALE"
                  id="PROFESSION_LIBERALE"
                  className="text-primary"
                />
                <Label
                  htmlFor="PROFESSION_LIBERALE"
                  className="text-sm font-medium"
                >
                  Profession libérale
                </Label>
              </div>
              <div
                className="flex items-center space-x-2 bg-[var(--muted)] p-3 rounded-2xl"
                style={{
                  boxShadow:
                    "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.05)",
                }}
              >
                <RadioGroupItem
                  value="AUTO_ENTREPRENEUR"
                  id="AUTO_ENTREPRENEUR"
                  className="text-primary"
                />
                <Label
                  htmlFor="AUTO_ENTREPRENEUR"
                  className="text-sm font-medium"
                >
                  Auto-entrepreneur
                </Label>
              </div>
              <div
                className="flex items-center space-x-2 bg-[var(--muted)] p-3 rounded-2xl"
                style={{
                  boxShadow:
                    "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.05)",
                }}
              >
                <RadioGroupItem
                  value="PORTAGE_SALARIAL"
                  id="PORTAGE_SALARIAL"
                  className="text-primary"
                />
                <Label
                  htmlFor="PORTAGE_SALARIAL"
                  className="text-sm font-medium"
                >
                  Portage salarial
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
          <CardHeader>
            <CardDescription className="text-[var(--muted-foreground)]">
              <div className="pt-4 border-t mt-4">
                Ajoutez des primes annuelles
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prime" className="text-sm">
                Montant annuel (€)
              </Label>
              <Input
                id="prime"
                type="text"
                inputMode="decimal"
                className="text-right bg-[var(--muted)] border-none rounded-2xl px-6 py-3 text-lg font-medium placeholder:text-[var(--muted-foreground)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] ring-offset-0"
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
          </CardContent>
        </Card>

        {/* Carte pour le temps de travail et prélèvement */}
        <Card
          className="rounded-3xl shadow-md border-none overflow-hidden relative"
          style={{
            boxShadow:
              "var(--shadow-lg), inset 2px 2px 10px 2px rgba(255, 255, 255, 0.1)",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)] bg-clip-text text-transparent">
              Temps de Travail et Impôts
            </CardTitle>
            <CardDescription className="text-[var(--muted-foreground)]">
              Ajustez vos paramètres
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Temps de travail</Label>
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
                  // met à jour le formulaire et l'état global
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

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Taux prélèvement à la source</Label>
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

        {/* Carte pour la prime exceptionnelle */}
        <Card
          className="rounded-3xl shadow-md border-none overflow-hidden relative"
          style={{
            boxShadow:
              "var(--shadow-lg), inset 2px 2px 10px 2px rgba(255, 255, 255, 0.1)",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)] bg-clip-text text-transparent">
              Résultat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="pt-4 border-t mt-4">
              <h3 className="font-semibold mb-4">Estimation après impôts</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthly-after-tax" className="text-sm">
                    Mensuel après impôts
                  </Label>
                  <Input
                    id="monthly-after-tax"
                    type="text"
                    className="text-right bg-[var(--muted)] border-none rounded-2xl px-6 py-3 text-lg font-medium placeholder:text-[var(--muted-foreground)]"
                    style={{
                      boxShadow:
                        "inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.1)",
                    }}
                    value={formatNumberSmart(
                      monthlyNetAfterTax,
                      "monthly-after-tax"
                    )}
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="yearly-after-tax" className="text-sm">
                    Annuel après impôts
                  </Label>
                  <Input
                    id="yearly-after-tax"
                    type="text"
                    className="text-right bg-[var(--muted)] border-none rounded-2xl px-6 py-3 text-lg font-medium placeholder:text-[var(--muted-foreground)]"
                    style={{
                      boxShadow:
                        "inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.1)",
                    }}
                    value={formatNumberSmart(
                      annualNetWithPrime,
                      "yearly-after-tax"
                    )}
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="pt-4 border-t mt-4">
              <span className="text-lg font-medium">
                Cotisations sociales :{" "}
                {Math.round(
                  ({
                    NON_CADRE: 0.22,
                    CADRE: 0.22,
                    FONCTION_PUBLIQUE: 0.15,
                    AUTO_ENTREPRENEUR: 0.22,
                    PORTAGE_SALARIAL: 0.22,
                    PROFESSION_LIBERALE: 0.246,
                  }[status] || 0) * 100
                )}{" "}
                %
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-8">
        <Button
          onClick={resetForm}
          variant="outline"
          className="px-8 py-6 rounded-2xl text-lg font-medium bg-[var(--card)] hover:bg-[var(--accent)] transition-colors border-none"
          style={{
            boxShadow:
              "var(--shadow-md), inset 2px 2px 4px rgba(255, 255, 255, 0.1)",
          }}
        >
          Réinitialiser les champs
        </Button>
      </div>
    </div>
  );
}
