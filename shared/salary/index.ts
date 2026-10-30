/**
 * Moteur de calcul brut → net partagé par le site (Next.js) et l'app (Expo).
 * TypeScript pur : aucune dépendance à React, au DOM ou à React Native.
 *
 * Modèle : taux global de cotisations par statut (somme des lignes du barème),
 * PAS appliqué en pourcentage sur le net. C'est une estimation, pas une fiche de paie.
 */
import ratesJson from "./rates_fr_2026.json";

export type StatusType =
  | "NON_CADRE"
  | "CADRE"
  | "PORTAGE_SALARIAL"
  | "FONCTION_PUBLIQUE"
  | "PROFESSION_LIBERALE"
  | "AUTO_ENTREPRENEUR";

export type PeriodType = "hourly" | "daily" | "monthly" | "yearly";
export type DirectionType = "brut" | "net";

export const STATUSES: readonly StatusType[] = [
  "NON_CADRE",
  "CADRE",
  "PORTAGE_SALARIAL",
  "FONCTION_PUBLIQUE",
  "PROFESSION_LIBERALE",
  "AUTO_ENTREPRENEUR",
];

export interface ChargeItem {
  label: string;
  /** Taux nominal */
  rate: number;
  /** Part du brut soumise au taux (1 par défaut, 0,9825 pour CSG/CRDS) */
  base?: number;
}

export interface StatusRates {
  title: string;
  note?: string;
  items: ChargeItem[];
}

export interface RatesTable {
  version: string;
  validFrom: string;
  lastUpdate: string;
  legalHoursPerWeek: number;
  smic: { hourly: number; monthly: number; source: string };
  pass: { yearly: number; monthly: number; source: string };
  employerChargesRate: number;
  statuses: Record<StatusType, StatusRates>;
  averageNet: Record<StatusType, { value: number; source: string }>;
  benchmarks: {
    note: string;
    median: number;
    average: number;
    top10: number;
    top1: number;
  };
}

export const RATES: RatesTable = ratesJson as RatesTable;

const WEEKS_PER_YEAR = 52;
const WORKING_DAYS_PER_WEEK = 5;

/** Taux effectif d'une ligne, rapporté au brut total */
export function effectiveRate(item: ChargeItem): number {
  return item.rate * (item.base ?? 1);
}

/** Taux global de cotisations salariales d'un statut (somme des lignes) */
export function employeeRate(
  status: StatusType,
  rates: RatesTable = RATES,
): number {
  return rates.statuses[status].items.reduce(
    (sum, item) => sum + effectiveRate(item),
    0,
  );
}

export function hoursPerWeekFor(
  workPercent: number,
  rates: RatesTable = RATES,
): number {
  return (rates.legalHoursPerWeek * workPercent) / 100;
}

/** Nombre d'heures contenues dans une période */
export function hoursInPeriod(period: PeriodType, hoursPerWeek: number): number {
  switch (period) {
    case "hourly":
      return 1;
    case "daily":
      return hoursPerWeek / WORKING_DAYS_PER_WEEK;
    case "monthly":
      return (hoursPerWeek * WEEKS_PER_YEAR) / 12;
    case "yearly":
      return hoursPerWeek * WEEKS_PER_YEAR;
  }
}

/** "1 234,5" → 1234.5 ; valeur vide ou invalide → 0 */
export function parseAmount(value: number | string): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const n = parseFloat(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export interface SalaryInput {
  direction: DirectionType;
  period: PeriodType;
  value: number | string;
  status: StatusType;
  /** Temps de travail en % d'un temps plein (10-100) */
  workPercent: number;
  /** Taux de prélèvement à la source en % (0-100) */
  taxRate: number;
  /** Prime annuelle brute */
  prime: number;
}

type ByPeriod = Record<PeriodType, number>;

export interface SalaryResult {
  charges: number;
  hoursPerWeek: number;
  brut: ByPeriod;
  /** Net avant prélèvement à la source */
  net: ByPeriod;
  monthlyNetAfterTax: number;
  yearlyNetAfterTax: number;
  /** Net annuel après impôt, prime nette incluse */
  annualNetWithPrime: number;
}

const PERIODS: readonly PeriodType[] = ["hourly", "daily", "monthly", "yearly"];

export function computeSalary(
  input: SalaryInput,
  rates: RatesTable = RATES,
): SalaryResult {
  const charges = employeeRate(input.status, rates);
  const hoursPerWeek = hoursPerWeekFor(input.workPercent, rates);
  const tax = input.taxRate / 100;

  const hours = hoursInPeriod(input.period, hoursPerWeek);
  const perHour = hours > 0 ? parseAmount(input.value) / hours : 0;
  const hourlyBrut = input.direction === "brut" ? perHour : perHour / (1 - charges);

  const brut = {} as ByPeriod;
  const net = {} as ByPeriod;
  for (const period of PERIODS) {
    brut[period] = hourlyBrut * hoursInPeriod(period, hoursPerWeek);
    net[period] = brut[period] * (1 - charges);
  }

  const monthlyNetAfterTax = net.monthly * (1 - tax);
  const yearlyNetAfterTax = net.yearly * (1 - tax);
  const primeNet = (input.prime || 0) * (1 - charges) * (1 - tax);

  return {
    charges,
    hoursPerWeek,
    brut,
    net,
    monthlyNetAfterTax,
    yearlyNetAfterTax,
    annualNetWithPrime: yearlyNetAfterTax + primeNet,
  };
}

export interface FreelanceEquivalent {
  /** Coût total employeur mensuel (= CA mensuel à facturer) */
  superBrut: number;
  netBeforeTax: number;
  netAfterTax: number;
}

/** Ce que toucherait un micro-entrepreneur facturant le coût employeur du poste */
export function freelanceEquivalent(
  monthlyBrut: number,
  taxRate: number,
  rates: RatesTable = RATES,
): FreelanceEquivalent {
  const superBrut = monthlyBrut * (1 + rates.employerChargesRate);
  const netBeforeTax = superBrut * (1 - employeeRate("AUTO_ENTREPRENEUR", rates));
  return {
    superBrut,
    netBeforeTax,
    netAfterTax: netBeforeTax * (1 - taxRate / 100),
  };
}

export interface Benchmark {
  label: string;
  value: number;
}

/** Repères de salaires nets mensuels, SMIC net calculé avec le barème courant */
export function salaryBenchmarks(rates: RatesTable = RATES): Benchmark[] {
  const smicNet = Math.round(
    rates.smic.monthly * (1 - employeeRate("NON_CADRE", rates)),
  );
  return [
    { label: "SMIC Net", value: smicNet },
    { label: "Médian", value: rates.benchmarks.median },
    { label: "Moyen", value: rates.benchmarks.average },
    { label: "Top 10%", value: rates.benchmarks.top10 },
    { label: "Top 1%", value: rates.benchmarks.top1 },
  ];
}
