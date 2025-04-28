import { useCallback, useEffect, useMemo, useState } from "react";

type Period = "hourly" | "daily" | "monthly" | "yearly";
type Direction = "brut" | "net";
export type StatusType =
  | "NON_CADRE"
  | "CADRE"
  | "FONCTION_PUBLIQUE"
  | "AUTO_ENTREPRENEUR"
  | "PORTAGE_SALARIAL"
  | "PROFESSION_LIBERALE";

type RateJson = {
  [key in keyof typeof DEFAULT_CHARGES]: { employee: number };
};

const SMIC_2025 = 11.65;
const DEFAULT_HOURS = 35;

const DEFAULT_CHARGES = {
  NON_CADRE: 0.22,
  CADRE: 0.22,
  FONCTION_PUBLIQUE: 0.15,
  AUTO_ENTREPRENEUR: 0.22,
  PORTAGE_SALARIAL: 0.22,
  PROFESSION_LIBERALE: 0.45,
};

function brutFromNet(net: number, charges: number, tax: number) {
  // Inverse de net = brut * (1-charges) * (1-tax)
  return net / ((1 - charges) * (1 - tax));
}

export function useCalculator() {
  const [status, setStatus] = useState<StatusType>("NON_CADRE");
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
  const [rates, setRates] = useState<RateJson | null>(null);

  const hoursPerWeek = useMemo(
    () => Math.round((DEFAULT_HOURS * workPercent) / 100),
    [workPercent]
  );
  const charges = rates?.[status]?.employee ?? DEFAULT_CHARGES[status];
  const tax = taxRate / 100;

  useEffect(() => {
    (async () => {
      try {
        const mod = await import("../../data/rates_fr_2025.json");
        if (mod && mod.rates) {
          // Merge pour garantir toutes les clés
          const merged: RateJson = Object.keys(DEFAULT_CHARGES).reduce(
            (acc, key) => {
              acc[key as keyof RateJson] = mod.rates[key as keyof RateJson] ?? {
                employee: DEFAULT_CHARGES[key as keyof typeof DEFAULT_CHARGES],
              };
              return acc;
            },
            {} as RateJson
          );
          setRates(merged);
        }
      } catch {
        // silent fallback
      }
    })();
  }, []);

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

  // Net = brut - charges (sans impôt)
  const calcNet = useCallback(
    (brut: number | string) => {
      if (brut === "" || isNaN(Number(brut))) return 0;
      return Number(brut) * (1 - charges);
    },
    [charges]
  );

  const hourlyNet = useMemo(() => calcNet(hourlyBrut), [hourlyBrut, calcNet]);
  const dailyNet = useMemo(() => calcNet(dailyBrut), [dailyBrut, calcNet]);
  const monthlyNet = useMemo(
    () => calcNet(monthlyBrut),
    [monthlyBrut, calcNet]
  );
  const yearlyNet = useMemo(() => calcNet(yearlyBrut), [yearlyBrut, calcNet]);

  // Net après impôt (pour la card Résultat uniquement)
  const monthlyNetAfterTax = useMemo(
    () => calcNet(monthlyBrut) * (1 - tax),
    [monthlyBrut, calcNet, tax]
  );
  const yearlyNetAfterTax = useMemo(
    () => calcNet(yearlyBrut) * (1 - tax),
    [yearlyBrut, calcNet, tax]
  );
  const annualNetWithPrime = useMemo(
    () => Number(yearlyNetAfterTax) + Number(prime || 0),
    [yearlyNetAfterTax, prime]
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
      monthlyNetAfterTax,
      yearlyNetAfterTax,
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
