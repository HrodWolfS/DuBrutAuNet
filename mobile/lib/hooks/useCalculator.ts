import { useState, useMemo, useEffect } from "react";
import {
  computeSalary,
  RATES,
  type DirectionType,
  type PeriodType,
  type StatusType,
} from "../../../shared/salary";
import { loadPrefs, savePrefs, clearPrefs } from "../storage";

export type { DirectionType, PeriodType, StatusType };

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

const DEFAULT_INPUT: InputState = {
  direction: "brut",
  period: "hourly",
  value: RATES.smic.hourly,
};

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

  const result = useMemo(
    () => computeSalary({ ...input, status, workPercent, taxRate, prime }),
    [input, status, workPercent, taxRate, prime],
  );
  const { hoursPerWeek, monthlyNetAfterTax, yearlyNetAfterTax, annualNetWithPrime } =
    result;

  const values: CalculatorValues = {
    hourlyBrut: result.brut.hourly,
    dailyBrut: result.brut.daily,
    monthlyBrut: result.brut.monthly,
    yearlyBrut: result.brut.yearly,
    hourlyNet: result.net.hourly,
    dailyNet: result.net.daily,
    monthlyNet: result.net.monthly,
    yearlyNet: result.net.yearly,
    charges: result.charges,
  };

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
