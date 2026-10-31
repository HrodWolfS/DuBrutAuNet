import {
  computeSalary,
  RATES,
  type DirectionType,
  type PeriodType,
  type StatusType,
} from "@/shared/salary";
import { useCallback, useMemo, useState } from "react";

export type { StatusType };

type Values = Record<PeriodType, number | string>;

export function useCalculator() {
  const [status, setStatus] = useState<StatusType>("NON_CADRE");
  const [taxRate, setTaxRate] = useState(14);
  const [workPercent, setWorkPercent] = useState(100);
  const [prime, setPrime] = useState(0);
  // Source de vérité : { direction, period, value }
  // value est toujours la valeur brute non formatée
  const [input, setInput] = useState<{
    direction: DirectionType;
    period: PeriodType;
    value: number | string;
  }>({ direction: "brut", period: "hourly", value: RATES.smic.hourly });

  const result = useMemo(
    () => computeSalary({ ...input, status, workPercent, taxRate, prime }),
    [input, status, workPercent, taxRate, prime],
  );

  // Le champ en cours de saisie garde la valeur tapée, les autres sont calculés
  const withInput = (direction: DirectionType, computed: Values): Values => {
    if (input.direction !== direction) return computed;
    return { ...computed, [input.period]: input.value.toString() };
  };

  const values = {
    brut: withInput("brut", result.brut),
    net: withInput("net", result.net),
    rawBrut: result.brut,
    rawNet: result.net,
  };

  const handleValueChange = useCallback(
    (value: string, period: PeriodType, direction: DirectionType) => {
      const cleanValue = value.replace(/[^\d.,]/g, "").replace(/,/g, ".");
      setInput({ direction, period, value: cleanValue });
    },
    [],
  );

  const handleReset = useCallback(() => {
    setInput({ direction: "brut", period: "hourly", value: "" });
    setPrime(0);
  }, []);

  return [
    {
      values,
      status,
      taxRate,
      workPercent,
      hoursPerWeek: result.hoursPerWeek,
      prime,
      charges: result.charges,
      annualNetWithPrime: result.annualNetWithPrime,
      monthlyNetAfterTax: result.monthlyNetAfterTax,
      yearlyNetAfterTax: result.yearlyNetAfterTax,
    },
    {
      handleValueChange,
      handleReset,
      setStatus,
      setTaxRate,
      setWorkPercent,
      setPrime,
    },
  ] as const;
}
