import { describe, expect, it } from "vitest";
import { convert, type Input } from "@/lib/convert";
import rates from "@/data/rates_fr_2025.json";

type Status =
  | "NON_CADRE"
  | "CADRE"
  | "FONCTION_PUBLIQUE"
  | "PORTAGE_SALARIAL"
  | "AUTO_ENTREPRENEUR"
  | "PROFESSION_LIBERALE";

/* -------- helpers ------------------------------------------------------- */
const brutToNet = (amount: number, status: Status) =>
  +(amount * (1 - rates.rates[status].employee)).toFixed(2);
const netToBrut = (amount: number, status: Status) =>
  +(amount / (1 - rates.rates[status].employee)).toFixed(2);

/* -------- 1. table-driven tests brut → net ------------------------------ */
describe.each<Status>([
  "NON_CADRE",
  "CADRE",
  "FONCTION_PUBLIQUE",
  "PORTAGE_SALARIAL",
  "AUTO_ENTREPRENEUR",
  "PROFESSION_LIBERALE",
])("convert — brut ➜ net (%s)", (status) => {
  const input: Input = {
    amount: 100, // 100 € brut horaire pour un test simple
    unit: "hourly",
    direction: "brut",
    status,
  };

  it(`calcule un net horaire cohérent pour ${status}`, () => {
    const { net } = convert(input);
    expect(net.hourly).toBeCloseTo(brutToNet(input.amount, status), 2);
  });
});

/* -------- 2. table-driven tests net → brut ------------------------------ */
describe.each<Status>([
  "NON_CADRE",
  "CADRE",
  "FONCTION_PUBLIQUE",
  "PORTAGE_SALARIAL",
  "AUTO_ENTREPRENEUR",
  "PROFESSION_LIBERALE",
])("convert — net ➜ brut (%s)", (status) => {
  const input: Input = {
    amount: 100, // 100 € net horaire
    unit: "hourly",
    direction: "net",
    status,
  };

  it(`calcule un brut horaire cohérent pour ${status}`, () => {
    const { brut } = convert(input);
    expect(brut.hourly).toBeCloseTo(netToBrut(input.amount, status), 2);
  });
});

/* -------- 3. custom weekly hours (40 h) --------------------------------- */
it("gère un temps plein à 40 h/semaine", () => {
  const input: Input = {
    amount: 20, // 20 € brut horaire
    unit: "hourly",
    direction: "brut",
    status: "NON_CADRE",
    hoursPerWeek: 40,
  };

  const { brut } = convert(input);
  // 20 € × 40 h × 52 semaines / 12 ≈ 3466,67 € mensuel
  expect(brut.monthly).toBeCloseTo(3466.67, 2);
});

/* -------- 4. prime exceptionnelle intégrée dans l’annuel ---------------- */
it("intègre correctement la prime exceptionnelle dans l’annuel", () => {
  const input: Input = {
    amount: 3000, // 3 000 € brut mensuel
    unit: "monthly",
    direction: "brut",
    status: "CADRE",
    prime: 4000, // 4 000 € brut de prime
  };

  const { brut } = convert(input);
  // annuel brut = 3 000 × 12 + 4 000 = 40 000
  expect(brut.yearly).toBe(40000);
});
