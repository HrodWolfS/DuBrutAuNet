import { type Input as SalaryInput } from "@/lib/convert";
import { useCallback, useMemo, useState } from "react";

type Period = "hourly" | "daily" | "monthly" | "yearly";
type Direction = "brut" | "net";

const SMIC_2025 = 11.65;
const DEFAULT_HOURS = 35;

const CHARGES_SOCIALES = {
  CDI: 0.22,
  CDD: 0.22,
  FONCTION_PUBLIQUE: 0.15,
  ALTERNANCE: 0.12,
  AUTO_ENTREPRENEUR: 0.22,
};

function brutFromNet(net: number, charges: number, tax: number) {
  // Inverse de net = brut * (1-charges) * (1-tax)
  return net / ((1 - charges) * (1 - tax));
}

export function useCalculator() {
  const [status, setStatus] = useState<SalaryInput["status"]>("CDI");
  const [taxRate, setTaxRate] = useState(14);
  const [workPercent, setWorkPercent] = useState(100);
  const [prime, setPrime] = useState(0);
  // Source de vérité : { direction, period, value }
  // value est toujours la valeur brute non formatée
  const [input, setInput] = useState<{
    direction: Direction;
    period: Period;
    value: number | string;
  }>({ direction: "brut", period: "hourly", value: SMIC_2025 });

  const hoursPerWeek = useMemo(
    () => Math.round((DEFAULT_HOURS * workPercent) / 100),
    [workPercent]
  );
  const charges = CHARGES_SOCIALES[status];
  const tax = taxRate / 100;

  // Conversion helpers
  const getBrutFrom = useCallback(
    (value: number, period: Period) => {
      if (period === "hourly") return value;
      if (period === "daily")
        return hoursPerWeek ? value / (hoursPerWeek / 7) : 0;
      if (period === "monthly")
        return hoursPerWeek ? value / ((hoursPerWeek * 52) / 12) : 0;
      if (period === "yearly")
        return hoursPerWeek ? value / (hoursPerWeek * 52) : 0;
      return value;
    },
    [hoursPerWeek]
  );

  // Calculs principaux
  const { hourlyBrut, dailyBrut, monthlyBrut, yearlyBrut } = useMemo(() => {
    if (input.value === "" || isNaN(Number(input.value))) {
      return { hourlyBrut: 0, dailyBrut: 0, monthlyBrut: 0, yearlyBrut: 0 };
    }
    let baseBrut: number;
    if (input.direction === "brut") {
      baseBrut = getBrutFrom(Number(input.value), input.period);
    } else {
      const net = Number(input.value);
      const brut = brutFromNet(net, charges, tax);
      baseBrut = getBrutFrom(brut, input.period);
    }
    return {
      hourlyBrut: baseBrut,
      dailyBrut: baseBrut * (hoursPerWeek / 7),
      monthlyBrut: (baseBrut * hoursPerWeek * 52) / 12,
      yearlyBrut: baseBrut * hoursPerWeek * 52,
    };
  }, [input, charges, tax, getBrutFrom, hoursPerWeek]);

  // Net = brut - charges - impôt
  const calcNet = useCallback(
    (brut: number | string) => {
      if (brut === "" || isNaN(Number(brut))) return 0;
      const afterCharges = Number(brut) * (1 - charges);
      const afterTax = afterCharges * (1 - tax);
      return afterTax;
    },
    [charges, tax]
  );

  const hourlyNet = useMemo(() => calcNet(hourlyBrut), [hourlyBrut, calcNet]);
  const dailyNet = useMemo(() => calcNet(dailyBrut), [dailyBrut, calcNet]);
  const monthlyNet = useMemo(
    () => calcNet(monthlyBrut),
    [monthlyBrut, calcNet]
  );
  const yearlyNet = useMemo(() => calcNet(yearlyBrut), [yearlyBrut, calcNet]);
  const annualNetWithPrime = useMemo(
    () => Number(yearlyNet) + Number(prime || 0),
    [yearlyNet, prime]
  );

  // Valeurs pour l'interface utilisateur - non formatées
  // Cela permet d'utiliser ces valeurs brutes pour la saisie
  const values = {
    brut: {
      hourly:
        input.direction === "brut" && input.period === "hourly"
          ? input.value.toString()
          : hourlyBrut,
      daily:
        input.direction === "brut" && input.period === "daily"
          ? input.value.toString()
          : dailyBrut,
      monthly:
        input.direction === "brut" && input.period === "monthly"
          ? input.value.toString()
          : monthlyBrut,
      yearly:
        input.direction === "brut" && input.period === "yearly"
          ? input.value.toString()
          : yearlyBrut,
    },
    net: {
      hourly: hourlyNet,
      daily: dailyNet,
      monthly: monthlyNet,
      yearly: yearlyNet,
    },
    // Valeurs numériques brutes pour les calculs
    rawBrut: {
      hourly: hourlyBrut,
      daily: dailyBrut,
      monthly: monthlyBrut,
      yearly: yearlyBrut,
    },
    rawNet: {
      hourly: hourlyNet,
      daily: dailyNet,
      monthly: monthlyNet,
      yearly: yearlyNet,
    },
  };

  const handleValueChange = useCallback(
    (value: string, period: Period, direction: Direction) => {
      // Traiter la valeur entrée comme une chaîne brute
      // Nettoyer uniquement les caractères non numériques, mais garder le point ou la virgule
      const cleanValue = value.replace(/[^\d.,]/g, "").replace(/,/g, ".");
      setInput({ direction, period, value: cleanValue });
    },
    []
  );

  return [
    {
      values,
      status,
      taxRate,
      workPercent,
      hoursPerWeek,
      prime,
      annualNetWithPrime,
    },
    {
      handleValueChange,
      setStatus,
      setTaxRate,
      setWorkPercent,
      setPrime,
    },
  ] as const;
}
