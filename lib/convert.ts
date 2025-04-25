export interface Input {
  amount: number;
  unit: "hourly" | "daily" | "monthly" | "yearly";
  direction: "brut" | "net";
  status:
    | "CDI"
    | "CDD"
    | "FONCTION_PUBLIQUE"
    | "ALTERNANCE"
    | "AUTO_ENTREPRENEUR";
  hoursPerWeek?: number;
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

// TODO: Implémenter la vraie logique avec les taux
export function convert(input: Input): Output {
  const ratio = input.direction === "brut" ? 0.78 : 1.22;
  const baseAmount = input.amount;

  // Conversion en montant horaire
  let hourlyAmount: number;
  switch (input.unit) {
    case "hourly":
      hourlyAmount = baseAmount;
      break;
    case "daily":
      hourlyAmount = baseAmount / 7;
      break;
    case "monthly":
      hourlyAmount = baseAmount / 151.67;
      break;
    case "yearly":
      hourlyAmount = baseAmount / 1820;
      break;
  }

  // Application du ratio brut/net
  const convertedHourlyAmount =
    input.direction === "brut" ? hourlyAmount * ratio : hourlyAmount / ratio;

  // Calcul des autres montants
  const dailyAmount = hourlyAmount * 7;
  const monthlyAmount = hourlyAmount * 151.67;
  const yearlyAmount = hourlyAmount * 1820;

  const convertedDailyAmount =
    input.direction === "brut" ? dailyAmount * ratio : dailyAmount / ratio;

  const convertedMonthlyAmount =
    input.direction === "brut" ? monthlyAmount * ratio : monthlyAmount / ratio;

  const convertedYearlyAmount =
    input.direction === "brut" ? yearlyAmount * ratio : yearlyAmount / ratio;

  return {
    brut: {
      hourly: input.direction === "net" ? convertedHourlyAmount : hourlyAmount,
      daily: input.direction === "net" ? convertedDailyAmount : dailyAmount,
      monthly:
        input.direction === "net" ? convertedMonthlyAmount : monthlyAmount,
      yearly: input.direction === "net" ? convertedYearlyAmount : yearlyAmount,
    },
    net: {
      hourly: input.direction === "brut" ? convertedHourlyAmount : hourlyAmount,
      daily: input.direction === "brut" ? convertedDailyAmount : dailyAmount,
      monthly:
        input.direction === "brut" ? convertedMonthlyAmount : monthlyAmount,
      yearly: input.direction === "brut" ? convertedYearlyAmount : yearlyAmount,
    },
    details: {
      urssaf: {
        employee: monthlyAmount * 0.22,
        employer: monthlyAmount * 0.42,
      },
      csg: monthlyAmount * 0.098,
      crds: monthlyAmount * 0.005,
      total: monthlyAmount * 0.743,
    },
  };
}
