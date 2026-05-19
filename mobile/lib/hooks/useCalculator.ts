import { useState, useMemo, useEffect } from "react";
import ratesData from "../../data/rates_fr_2025.json";
import { loadPrefs, savePrefs, clearPrefs } from "../storage";

export type StatusType =
  | "NON_CADRE"
  | "CADRE"
  | "PORTAGE_SALARIAL"
  | "FONCTION_PUBLIQUE"
  | "PROFESSION_LIBERALE"
  | "AUTO_ENTREPRENEUR";

export type PeriodType = "hourly" | "daily" | "monthly" | "yearly";
export type DirectionType = "brut" | "net";

export interface InputState {
  direction: DirectionType;
  period: PeriodType;
  value: number | string;
}

export interface CalculatorValues {
  hourlyBrut: number;
  dailyBrut: number;
  monthlyBrut: number;
  yearlyBrut: number;
  hourlyNet: number;
  dailyNet: number;
  monthlyNet: number;
  yearlyNet: number;
  charges: number;
}

export interface CalculatorState {
  values: CalculatorValues;
  status: StatusType;
  taxRate: number;
  workPercent: number;
  hoursPerWeek: number;
  prime: number;
  annualNetWithPrime: number;
  monthlyNetAfterTax: number;
  yearlyNetAfterTax: number;
  input: InputState;
}

export interface CalculatorHandlers {
  handleValueChange: (
    direction: DirectionType,
    period: PeriodType,
    raw: string,
  ) => void;
  handleReset: () => void;
  setStatus: (status: StatusType) => void;
  setTaxRate: (rate: number) => void;
  setWorkPercent: (percent: number) => void;
  setPrime: (prime: number) => void;
}

const DEFAULT_HOURS = 35;

const DEFAULT_CHARGES: Record<StatusType, number> = {
  NON_CADRE: 0.22,
  CADRE: 0.22,
  FONCTION_PUBLIQUE: 0.15,
  AUTO_ENTREPRENEUR: 0.22,
  PORTAGE_SALARIAL: 0.22,
  PROFESSION_LIBERALE: 0.45,
};

const DEFAULT_INPUT: InputState = {
  direction: "brut",
  period: "hourly",
  value: 11.65,
};

function getBrutFrom(
  value: number,
  period: PeriodType,
  hoursPerWeek: number,
): number {
  switch (period) {
    case "hourly":
      return value;
    case "daily":
      return value / (hoursPerWeek / 7);
    case "monthly":
      return value / ((hoursPerWeek * 52) / 12);
    case "yearly":
      return value / (hoursPerWeek * 52);
    default:
      return value;
  }
}

function brutFromNet(net: number, charges: number): number {
  return net / (1 - charges);
}

function getChargesRate(status: StatusType): number {
  const rateEntry = ratesData.rates[status as keyof typeof ratesData.rates];
  if (rateEntry && typeof rateEntry.employee === "number") {
    return rateEntry.employee;
  }
  return DEFAULT_CHARGES[status];
}

export function useCalculator(): [
  CalculatorState,
  CalculatorHandlers,
  boolean,
] {
  const [status, setStatusState] = useState<StatusType>("NON_CADRE");
  const [taxRate, setTaxRateState] = useState<number>(14);
  const [workPercent, setWorkPercentState] = useState<number>(100);
  const [prime, setPrimeState] = useState<number>(0);
  const [input, setInput] = useState<InputState>(DEFAULT_INPUT);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Load persisted prefs on mount
  useEffect(() => {
    loadPrefs().then((saved) => {
      if (saved) {
        setStatusState(saved.status);
        setTaxRateState(saved.taxRate);
        setWorkPercentState(saved.workPercent);
        setPrimeState(saved.prime);
        setInput(saved.input);
      }
      setIsReady(true);
    });
  }, []);

  // Save prefs whenever inputs change (skip until loaded)
  useEffect(() => {
    if (!isReady) return;
    savePrefs({ input, status, taxRate, workPercent, prime });
  }, [input, status, taxRate, workPercent, prime, isReady]);

  const hoursPerWeek = Math.round((DEFAULT_HOURS * workPercent) / 100);
  const charges = getChargesRate(status);

  const values = useMemo<CalculatorValues>(() => {
    const rawValue =
      typeof input.value === "string"
        ? parseFloat(input.value.replace(",", ".")) || 0
        : input.value;

    let hourlyBrut: number;

    if (input.direction === "brut") {
      hourlyBrut = getBrutFrom(rawValue, input.period, hoursPerWeek);
    } else {
      const hourlyNet = getBrutFrom(rawValue, input.period, hoursPerWeek);
      hourlyBrut = brutFromNet(hourlyNet, charges);
    }

    const dailyBrut = hourlyBrut * (hoursPerWeek / 7);
    const monthlyBrut = (hourlyBrut * hoursPerWeek * 52) / 12;
    const yearlyBrut = hourlyBrut * hoursPerWeek * 52;

    return {
      hourlyBrut,
      dailyBrut,
      monthlyBrut,
      yearlyBrut,
      hourlyNet: hourlyBrut * (1 - charges),
      dailyNet: dailyBrut * (1 - charges),
      monthlyNet: monthlyBrut * (1 - charges),
      yearlyNet: yearlyBrut * (1 - charges),
      charges,
    };
  }, [input, hoursPerWeek, charges]);

  const monthlyNetAfterTax = values.monthlyNet * (1 - taxRate / 100);
  const yearlyNetAfterTax = values.yearlyNet * (1 - taxRate / 100);
  const annualNetWithPrime = yearlyNetAfterTax + prime;

  const handleValueChange = (
    direction: DirectionType,
    period: PeriodType,
    raw: string,
  ) => {
    setInput({ direction, period, value: raw });
  };

  const handleReset = () => {
    setInput(DEFAULT_INPUT);
    setStatusState("NON_CADRE");
    setTaxRateState(14);
    setWorkPercentState(100);
    setPrimeState(0);
    clearPrefs();
  };

  const setStatus = (s: StatusType) => setStatusState(s);
  const setTaxRate = (r: number) => setTaxRateState(r);
  const setWorkPercent = (p: number) => setWorkPercentState(p);
  const setPrime = (p: number) => setPrimeState(p);

  const state: CalculatorState = {
    values,
    status,
    taxRate,
    workPercent,
    hoursPerWeek,
    prime,
    annualNetWithPrime,
    monthlyNetAfterTax,
    yearlyNetAfterTax,
    input,
  };

  const handlers: CalculatorHandlers = {
    handleValueChange,
    handleReset,
    setStatus,
    setTaxRate,
    setWorkPercent,
    setPrime,
  };

  return [state, handlers, isReady];
}
