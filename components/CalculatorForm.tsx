"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { type Input as SalaryInput } from "@/lib/convert";
import { useCalculator } from "@/lib/hooks/useCalculator";
import { ChargeBreakdown } from "./ChargeBreakdown";

const STATUSES = [
  { id: "CDI", label: "CDI", icon: "👔" },
  { id: "CDD", label: "CDD", icon: "📄" },
  { id: "FONCTION_PUBLIQUE", label: "Fonction Publique", icon: "🏛️" },
  { id: "ALTERNANCE", label: "Alternance", icon: "🎓" },
  { id: "AUTO_ENTREPRENEUR", label: "Auto-Entrepreneur", icon: "🚀" },
] as const;

export default function CalculatorForm() {
  const [
    { values, status, taxRate, hoursPerWeek },
    { handleValueChange, setStatus, setTaxRate, setHoursPerWeek },
  ] = useCalculator();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Statut */}
      <Card className="p-6">
        <Label className="text-lg font-semibold mb-4 block">Statut</Label>
        <RadioGroup
          defaultValue={status}
          onValueChange={(value: string) =>
            setStatus(value as SalaryInput["status"])
          }
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {STATUSES.map(({ id, label, icon }) => (
            <Label
              key={id}
              className={`flex items-center space-x-2 p-4 rounded-lg border cursor-pointer hover:bg-accent ${
                status === id ? "border-primary bg-accent" : ""
              }`}
              htmlFor={id}
            >
              <RadioGroupItem value={id} id={id} className="sr-only" />
              <span className="text-2xl">{icon}</span>
              <span>{label}</span>
            </Label>
          ))}
        </RadioGroup>
      </Card>

      {/* Paramètres */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Label className="text-lg font-semibold mb-4 block">
              Taux d'imposition : {taxRate}%
            </Label>
            <Slider
              value={[taxRate]}
              onValueChange={([value]: number[]) => setTaxRate(value)}
              max={45}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <Label className="text-lg font-semibold mb-4 block">
              Heures par semaine : {hoursPerWeek}h
            </Label>
            <Slider
              value={[hoursPerWeek]}
              onValueChange={([value]: number[]) => setHoursPerWeek(value)}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Grille de calcul */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(["brut", "net"] as const).map((direction) => (
          <Card key={direction} className="p-6">
            <h3 className="text-lg font-semibold mb-4 capitalize">
              {direction}
            </h3>
            <div className="space-y-4">
              {(["hourly", "daily", "monthly", "yearly"] as const).map(
                (period) => (
                  <div key={period} className="space-y-2">
                    <Label
                      htmlFor={`${direction}-${period}`}
                      className="capitalize"
                    >
                      {period === "hourly" && "Horaire"}
                      {period === "daily" && "Journalier"}
                      {period === "monthly" && "Mensuel"}
                      {period === "yearly" && "Annuel"}
                    </Label>
                    <div className="relative">
                      <Input
                        id={`${direction}-${period}`}
                        type="number"
                        min={0}
                        value={values[direction][period]}
                        onChange={(e) =>
                          handleValueChange(e.target.value, period, direction)
                        }
                        className="pl-8"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        €
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Détail des charges */}
      {values.brut.monthly && (
        <ChargeBreakdown
          status={status}
          brutAmount={Number(values.brut.monthly)}
          taxRate={taxRate}
        />
      )}
    </div>
  );
}
