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
  const amount = input.amount * ratio;

  return {
    brut: {
      hourly: input.direction === "brut" ? input.amount : amount,
      daily: input.direction === "brut" ? input.amount * 7 : amount * 7,
      monthly:
        input.direction === "brut" ? input.amount * 151.67 : amount * 151.67,
      yearly: input.direction === "brut" ? input.amount * 1820 : amount * 1820,
    },
    net: {
      hourly: input.direction === "net" ? input.amount : amount,
      daily: input.direction === "net" ? input.amount * 7 : amount * 7,
      monthly:
        input.direction === "net" ? input.amount * 151.67 : amount * 151.67,
      yearly: input.direction === "net" ? input.amount * 1820 : amount * 1820,
    },
    details: {
      urssaf: {
        employee: amount * 0.22,
        employer: amount * 0.42,
      },
      csg: amount * 0.098,
      crds: amount * 0.005,
      total: amount * 0.743,
    },
  };
}
