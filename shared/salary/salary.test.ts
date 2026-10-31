import { describe, expect, it } from "vitest";
import {
  computeSalary,
  employeeRate,
  freelanceEquivalent,
  parseAmount,
  RATES,
  salaryBenchmarks,
  STATUSES,
  type SalaryInput,
} from "./index";

// Les valeurs attendues sont calculées à la main (barème juin 2026),
// pas recalculées à partir du JSON : un changement de taux doit casser ces tests.

const base: SalaryInput = {
  direction: "brut",
  period: "monthly",
  value: 0,
  status: "NON_CADRE",
  workPercent: 100,
  taxRate: 0,
  prime: 0,
};

describe("barème 2026", () => {
  it("SMIC horaire et mensuel au 1er juin 2026", () => {
    expect(RATES.smic.hourly).toBe(12.31);
    expect(RATES.smic.monthly).toBe(1867.02);
    // 151,67 h par mois pour 35 h/semaine
    expect(RATES.smic.hourly * ((35 * 52) / 12)).toBeCloseTo(RATES.smic.monthly, 1);
  });

  it("taux globaux par statut", () => {
    expect(employeeRate("NON_CADRE")).toBeCloseTo(0.22, 4);
    expect(employeeRate("PORTAGE_SALARIAL")).toBeCloseTo(0.22, 4);
    expect(employeeRate("CADRE")).toBeCloseTo(0.245, 4);
    expect(employeeRate("FONCTION_PUBLIQUE")).toBeCloseTo(0.1941, 4);
    expect(employeeRate("PROFESSION_LIBERALE")).toBeCloseTo(0.3808, 4);
    expect(employeeRate("AUTO_ENTREPRENEUR")).toBeCloseTo(0.212, 4);
  });

  it("chaque statut a des lignes de cotisation plausibles", () => {
    for (const status of STATUSES) {
      const { items } = RATES.statuses[status];
      expect(items.length).toBeGreaterThan(0);
      for (const item of items) {
        expect(item.rate).toBeGreaterThan(0);
        expect(item.rate).toBeLessThan(0.25);
      }
    }
  });
});

describe("computeSalary", () => {
  it("SMIC temps plein non-cadre : 1 867,02 € brut → 1 456,27 € net", () => {
    const r = computeSalary({ ...base, period: "hourly", value: 12.31 });
    expect(r.brut.monthly).toBeCloseTo(1867.02, 1);
    expect(r.net.monthly).toBeCloseTo(1456.27, 1);
    expect(r.brut.yearly).toBeCloseTo(22404.2, 1);
  });

  it("journalier = 7 h pour un temps plein", () => {
    const r = computeSalary({ ...base, period: "hourly", value: 12.31 });
    expect(r.brut.daily).toBeCloseTo(86.17, 2);
  });

  it("cadre à 3 000 € brut mensuel → 2 264,99 € net", () => {
    const r = computeSalary({ ...base, status: "CADRE", value: 3000 });
    expect(r.net.monthly).toBeCloseTo(2264.99, 1);
    expect(r.brut.hourly).toBeCloseTo(19.78, 2);
  });

  it("net → brut : 2 000 € net non-cadre → 2 564,11 € brut", () => {
    const r = computeSalary({ ...base, direction: "net", value: 2000 });
    expect(r.brut.monthly).toBeCloseTo(2564.11, 1);
    expect(r.net.monthly).toBeCloseTo(2000, 6);
  });

  it("temps partiel 50 % au SMIC horaire", () => {
    const r = computeSalary({ ...base, period: "hourly", value: 12.31, workPercent: 50 });
    expect(r.hoursPerWeek).toBe(17.5);
    expect(r.brut.monthly).toBeCloseTo(933.51, 1);
  });

  it("le taux horaire ne dépend pas du temps de travail quand on saisit un mensuel", () => {
    const full = computeSalary({ ...base, value: 2000 });
    const part = computeSalary({ ...base, value: 1000, workPercent: 50 });
    expect(part.brut.hourly).toBeCloseTo(full.brut.hourly, 6);
  });

  it("PAS et prime brute : 2 000 € brut, PAS 10 %, prime 1 000 €", () => {
    const r = computeSalary({ ...base, value: 2000, taxRate: 10, prime: 1000 });
    expect(r.net.monthly).toBeCloseTo(1560, 1);
    expect(r.monthlyNetAfterTax).toBeCloseTo(1404, 1);
    expect(r.yearlyNetAfterTax).toBeCloseTo(16848, 0);
    // 16 848 + 1 000 × 0,78 × 0,9
    expect(r.annualNetWithPrime).toBeCloseTo(17550, 0);
  });

  it("saisie vide ou invalide → zéro partout", () => {
    for (const value of ["", "abc"]) {
      const r = computeSalary({ ...base, value });
      expect(r.brut.monthly).toBe(0);
      expect(r.net.yearly).toBe(0);
    }
  });
});

describe("freelanceEquivalent", () => {
  it("3 000 € brut → 4 350 € facturés → 3 427,80 € net avant PAS", () => {
    const r = freelanceEquivalent(3000, 0);
    expect(r.superBrut).toBeCloseTo(4350, 2);
    expect(r.netBeforeTax).toBeCloseTo(3427.8, 1);
    expect(freelanceEquivalent(3000, 10).netAfterTax).toBeCloseTo(3085.02, 1);
  });
});

describe("salaryBenchmarks", () => {
  it("le SMIC net est dérivé du barème", () => {
    const smic = salaryBenchmarks().find((b) => b.label === "SMIC Net");
    expect(smic?.value).toBe(1456);
  });

  it("les repères sont croissants", () => {
    const values = salaryBenchmarks().map((b) => b.value);
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });
});

describe("parseAmount", () => {
  it("accepte les formats français", () => {
    expect(parseAmount("1 234,5")).toBe(1234.5);
    expect(parseAmount("12.31")).toBe(12.31);
    expect(parseAmount("")).toBe(0);
    expect(parseAmount(Number.NaN)).toBe(0);
  });
});
