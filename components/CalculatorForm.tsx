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
import { useCalculator } from "@/lib/hooks/useCalculator";
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
      status: "CDI",
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
      amount: 0,
      unit: "hourly",
      direction: "brut",
      status: "CDI",
      hoursPerWeek: 35,
    });
    handleValueChange("0", "hourly", "brut");
    setStatus("CDI");
    setWorkPercent(100);
    setTaxRate(0);
    setPrime(0);
  };

  // Mettre à jour le statut
  const handleStatusChange = (newStatus: string) => {
    const mappedStatus = {
      "non-cadre": "CDI",
      cadre: "CDD",
      "fonction-publique": "FONCTION_PUBLIQUE",
      "profession-liberale": "AUTO_ENTREPRENEUR",
      "portage-salarial": "AUTO_ENTREPRENEUR",
    }[newStatus] as
      | "CDI"
      | "CDD"
      | "FONCTION_PUBLIQUE"
      | "ALTERNANCE"
      | "AUTO_ENTREPRENEUR";

    setStatus(mappedStatus);
    form.setValue("status", mappedStatus);
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

  // Synchroniser hoursPerWeek avec workPercent
  useEffect(() => {
    const hours = form.getValues("hoursPerWeek");
    if (hours) {
      setWorkPercent((hours / 35) * 100);
    }
  }, [form.watch("hoursPerWeek"), setWorkPercent]);

  // Synchroniser workPercent avec UI
  useEffect(() => {
    form.setValue("hoursPerWeek", Math.round((35 * workPercent) / 100));
  }, [workPercent, form]);

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
                    {status === "CDI" && (
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

        {/* Carte pour le statut */}
        <Card
          className="rounded-3xl shadow-md border-none overflow-hidden relative"
          style={{
            boxShadow:
              "var(--shadow-lg), inset 2px 2px 10px 2px rgba(255, 255, 255, 0.1)",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)] bg-clip-text text-transparent">
              Statut Professionnel
            </CardTitle>
            <CardDescription className="text-[var(--muted-foreground)]">
              Sélectionnez votre statut
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              defaultValue="non-cadre"
              className="grid grid-cols-3 gap-4 mt-2"
              onValueChange={handleStatusChange}
            >
              <div
                className="flex items-center space-x-2 bg-[var(--muted)] p-3 rounded-2xl"
                style={{
                  boxShadow:
                    "inset 2px 2px 5px rgba(0, 0, 0, 0.05), inset -2px -2px 5px rgba(255, 255, 255, 0.05)",
                }}
              >
                <RadioGroupItem
                  value="non-cadre"
                  id="non-cadre"
                  className="text-primary"
                />
                <Label htmlFor="non-cadre" className="text-sm font-medium">
                  Salarié non-cadre
                </Label>
              </div>
              <div
                className="flex items-center space-x-2 bg-[var(--muted)] p-3 rounded-2xl"
                style={{
                  boxShadow:
                    "inset 2px 2px 5px rgba(0, 0, 0, 0.05), inset -2px -2px 5px rgba(255, 255, 255, 0.05)",
                }}
              >
                <RadioGroupItem
                  value="cadre"
                  id="cadre"
                  className="text-primary"
                />
                <Label htmlFor="cadre" className="text-sm font-medium">
                  Salarié cadre
                </Label>
              </div>
              <div
                className="flex items-center space-x-2 bg-[var(--muted)] p-3 rounded-2xl"
                style={{
                  boxShadow:
                    "inset 2px 2px 5px rgba(0, 0, 0, 0.05), inset -2px -2px 5px rgba(255, 255, 255, 0.05)",
                }}
              >
                <RadioGroupItem
                  value="fonction-publique"
                  id="fonction-publique"
                  className="text-primary"
                />
                <Label
                  htmlFor="fonction-publique"
                  className="text-sm font-medium"
                >
                  Fonction publique
                </Label>
              </div>
              <div
                className="flex items-center space-x-2 bg-[var(--muted)] p-3 rounded-2xl"
                style={{
                  boxShadow:
                    "inset 2px 2px 5px rgba(0, 0, 0, 0.05), inset -2px -2px 5px rgba(255, 255, 255, 0.05)",
                }}
              >
                <RadioGroupItem
                  value="profession-liberale"
                  id="profession-liberale"
                  className="text-primary"
                />
                <Label
                  htmlFor="profession-liberale"
                  className="text-sm font-medium"
                >
                  Profession libérale
                </Label>
              </div>
              <div
                className="flex items-center space-x-2 bg-[var(--muted)] p-3 rounded-2xl"
                style={{
                  boxShadow:
                    "inset 2px 2px 5px rgba(0, 0, 0, 0.05), inset -2px -2px 5px rgba(255, 255, 255, 0.05)",
                }}
              >
                <RadioGroupItem
                  value="portage-salarial"
                  id="portage-salarial"
                  className="text-primary"
                />
                <Label
                  htmlFor="portage-salarial"
                  className="text-sm font-medium"
                >
                  Portage salarial
                </Label>
              </div>
            </RadioGroup>
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
                <span className="font-medium">{workPercent}%</span>
              </div>
              <Slider
                defaultValue={[100]}
                max={100}
                step={1}
                value={[workPercent]}
                onValueChange={(values) => setWorkPercent(values[0])}
                className="mt-2"
                style={{ height: "8px" }}
              />
              <div className="text-xs text-muted-foreground text-right">
                {hoursPerWeek} heures/semaine
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
              Prime Exceptionnelle
            </CardTitle>
            <CardDescription className="text-[var(--muted-foreground)]">
              Ajoutez des primes annuelles
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
                      values.net.monthly * (1 - taxRate / 100),
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
