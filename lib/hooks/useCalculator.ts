import { type Input as SalaryInput } from "@/lib/convert";
import { useCallback, useState } from "react";

type Period = "hourly" | "daily" | "monthly" | "yearly";
type Direction = "brut" | "net";

interface CalculatorState {
  values: Record<Direction, Record<Period, string>>;
  status: SalaryInput["status"];
  taxRate: number;
  hoursPerWeek: number;
}

interface CalculatorActions {
  handleValueChange: (
    value: string,
    period: Period,
    direction: Direction
  ) => void;
  setStatus: (status: SalaryInput["status"]) => void;
  setTaxRate: (rate: number) => void;
  setHoursPerWeek: (hours: number) => void;
}

const CONVERSION_RATES = {
  hourly: {
    daily: 7,
    monthly: 151.67, // 35h * 52 semaines / 12 mois
    yearly: 1820, // 35h * 52 semaines
  },
  daily: {
    hourly: 1 / 7,
    monthly: 21.67, // 151.67 / 7
    yearly: 260, // 52 semaines * 5 jours
  },
  monthly: {
    hourly: 1 / 151.67,
    daily: 1 / 21.67,
    yearly: 12,
  },
  yearly: {
    hourly: 1 / 1820,
    daily: 1 / 260,
    monthly: 1 / 12,
  },
} as const;

type ConversionRates = typeof CONVERSION_RATES;

const CHARGES_SOCIALES = {
  CDI: 0.22,
  CDD: 0.22,
  FONCTION_PUBLIQUE: 0.15,
  ALTERNANCE: 0.12,
  AUTO_ENTREPRENEUR: 0.22,
};

export function useCalculator(): [CalculatorState, CalculatorActions] {
  const [state, setState] = useState<CalculatorState>({
    values: {
      brut: {
        hourly: "",
        daily: "",
        monthly: "",
        yearly: "",
      },
      net: {
        hourly: "",
        daily: "",
        monthly: "",
        yearly: "",
      },
    },
    status: "CDI",
    taxRate: 14,
    hoursPerWeek: 35,
  });

  const convertValue = useCallback(
    (value: string, fromPeriod: Period, toPeriod: Period): string => {
      if (!value || isNaN(Number(value))) return "";
      const numValue = Number(value);
      if (fromPeriod === toPeriod) return value;

      const rates = CONVERSION_RATES[fromPeriod] as Record<Period, number>;
      const rate = rates[toPeriod] ?? 1;
      return (numValue * rate).toFixed(2);
    },
    []
  );

  const convertBrutToNet = useCallback(
    (brutValue: string): string => {
      if (!brutValue || isNaN(Number(brutValue))) return "";
      const numValue = Number(brutValue);
      const chargesSociales = CHARGES_SOCIALES[state.status];
      const taxRate = state.taxRate / 100;

      // Déduction des charges sociales puis de l'impôt
      const afterCharges = numValue * (1 - chargesSociales);
      const afterTax = afterCharges * (1 - taxRate);

      return afterTax.toFixed(2);
    },
    [state.status, state.taxRate]
  );

  const convertNetToBrut = useCallback(
    (netValue: string): string => {
      if (!netValue || isNaN(Number(netValue))) return "";
      const numValue = Number(netValue);
      const chargesSociales = CHARGES_SOCIALES[state.status];
      const taxRate = state.taxRate / 100;

      // On remonte de l'impôt puis des charges sociales
      const beforeTax = numValue / (1 - taxRate);
      const beforeCharges = beforeTax / (1 - chargesSociales);

      return beforeCharges.toFixed(2);
    },
    [state.status, state.taxRate]
  );

  const handleValueChange = useCallback(
    (value: string, period: Period, direction: Direction) => {
      setState((prev) => {
        const newValues = { ...prev.values };

        // Mise à jour de la valeur modifiée
        newValues[direction][period] = value;

        // Conversion pour toutes les périodes
        const periods: Period[] = ["hourly", "daily", "monthly", "yearly"];
        periods.forEach((toPeriod) => {
          if (toPeriod !== period) {
            newValues[direction][toPeriod] = convertValue(
              value,
              period,
              toPeriod
            );
          }
        });

        // Conversion brut/net
        const otherDirection = direction === "brut" ? "net" : "brut";
        const converter =
          direction === "brut" ? convertBrutToNet : convertNetToBrut;

        periods.forEach((toPeriod) => {
          newValues[otherDirection][toPeriod] = converter(
            newValues[direction][toPeriod]
          );
        });

        return {
          ...prev,
          values: newValues,
        };
      });
    },
    [convertValue, convertBrutToNet, convertNetToBrut]
  );

  const setStatus = useCallback((status: SalaryInput["status"]) => {
    setState((prev) => ({ ...prev, status }));
  }, []);

  const setTaxRate = useCallback((rate: number) => {
    setState((prev) => ({ ...prev, taxRate: rate }));
  }, []);

  const setHoursPerWeek = useCallback((hours: number) => {
    setState((prev) => ({ ...prev, hoursPerWeek: hours }));
  }, []);

  return [
    state,
    {
      handleValueChange,
      setStatus,
      setTaxRate,
      setHoursPerWeek,
    },
  ];
}
