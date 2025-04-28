import ratesTable from "@/data/rates_fr_2025.json";

export interface Input {
  amount: number;
  unit: "hourly" | "daily" | "monthly" | "yearly";
  direction: "brut" | "net";
  status:
    | "NON_CADRE"
    | "CADRE"
    | "FONCTION_PUBLIQUE"
    | "AUTO_ENTREPRENEUR"
    | "PORTAGE_SALARIAL"
    | "PROFESSION_LIBERALE";
  hoursPerWeek?: number;
  prime?: number;
}

export interface ChargeBreakdown {
  urssaf: {
    employee: number;
    employer: number;
  };
  csg: number;
  crds: number;
  total: number;
}

export interface Output {
  brut: {
    hourly: number;
    daily: number;
    monthly: number;
    yearly: number;
  };
  net: {
    hourly: number;
    daily: number;
    monthly: number;
    yearly: number;
  };
  details?: ChargeBreakdown;
}

export const DEFAULT_HOURS = 35;
const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

export function convert(input: Input): Output {
  const {
    amount,
    unit,
    direction,
    status,
    hoursPerWeek = DEFAULT_HOURS,
    prime = 0,
  } = input;

  const rate =
    ratesTable.rates?.[status as keyof typeof ratesTable.rates]?.employee ??
    0.22;

  // helpers
  const toNet = (brut: number) => +(brut * (1 - rate)).toFixed(2);
  const toBrut = (net: number) => +(net / (1 - rate)).toFixed(2);

  // ↓ 1. Normalise l'entrée en brut & net horaire
  let brutHourly: number;
  let netHourly: number;

  if (direction === "brut") {
    if (unit === "hourly") brutHourly = amount;
    else if (unit === "daily") brutHourly = amount / 7;
    else if (unit === "monthly")
      brutHourly = amount / ((hoursPerWeek * WEEKS_PER_YEAR) / MONTHS_PER_YEAR);
    else brutHourly = amount / (hoursPerWeek * WEEKS_PER_YEAR); // yearly

    netHourly = toNet(brutHourly);
  } else {
    // direction === "net"
    if (unit === "hourly") netHourly = amount;
    else if (unit === "daily") netHourly = amount / 7;
    else if (unit === "monthly")
      netHourly = amount / ((hoursPerWeek * WEEKS_PER_YEAR) / MONTHS_PER_YEAR);
    else netHourly = amount / (hoursPerWeek * WEEKS_PER_YEAR);

    brutHourly = toBrut(netHourly);
  }

  // ↓ 2. Dérive toutes les granularités
  const hYear = hoursPerWeek * WEEKS_PER_YEAR;
  const hMonth = hYear / MONTHS_PER_YEAR;

  const brut = {
    hourly: +brutHourly.toFixed(2),
    daily: +(brutHourly * 7).toFixed(2),
    monthly: +(brutHourly * hMonth).toFixed(2),
    yearly: +(brutHourly * hYear + prime).toFixed(2),
  };

  const net = {
    hourly: +netHourly.toFixed(2),
    daily: +(netHourly * 7).toFixed(2),
    monthly: +(netHourly * hMonth).toFixed(2),
    yearly: +(netHourly * hYear + prime * (1 - rate)).toFixed(2),
  };

  // Calcul des détails des charges pour compatibilité avec l'interface
  const monthlyBrut = brut.monthly;
  const details = {
    urssaf: {
      employee: +(monthlyBrut * rate).toFixed(2),
      employer: +(monthlyBrut * 0.42).toFixed(2),
    },
    csg: +(monthlyBrut * 0.098).toFixed(2),
    crds: +(monthlyBrut * 0.005).toFixed(2),
    total: +(monthlyBrut * 0.743).toFixed(2),
  };

  return { brut, net, details };
}
