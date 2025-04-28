import rates from "@/data/rates_fr_2025.json";
import { convert } from "@/lib/convert";
import { describe, expect, it } from "vitest";

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

/* -------- brut ➜ net --------------------------------------------------- */
describe.each<Status>([
  "NON_CADRE",
  "CADRE",
  "FONCTION_PUBLIQUE",
  "PORTAGE_SALARIAL",
  "AUTO_ENTREPRENEUR",
  "PROFESSION_LIBERALE",
])("convert — brut ➜ net (%s)", (status) => {
  it("calcule correctement le net horaire", () => {
    const result = convert({
      amount: 100,
      unit: "hourly",
      direction: "brut",
      status,
    });
    expect(result.net.hourly).toBeCloseTo(brutToNet(100, status), 2);
  });
});

/* -------- net ➜ brut --------------------------------------------------- */
describe.each<Status>([
  "NON_CADRE",
  "CADRE",
  "FONCTION_PUBLIQUE",
  "PORTAGE_SALARIAL",
  "AUTO_ENTREPRENEUR",
  "PROFESSION_LIBERALE",
])("convert — net ➜ brut (%s)", (status) => {
  it("calcule correctement le brut horaire", () => {
    const result = convert({
      amount: 100,
      unit: "hourly",
      direction: "net",
      status,
    });
    expect(result.brut.hourly).toBeCloseTo(netToBrut(100, status), 2);
  });
});

/* -------- semaine 40 h -------------------------------------------------- */
it("gère un plein temps 40 h/semaine", () => {
  const res = convert({
    amount: 20,
    unit: "hourly",
    direction: "brut",
    status: "NON_CADRE",
    hoursPerWeek: 40,
  });
  const expected = (20 * 40 * 52) / 12; // 3466,67
  expect(res.brut.monthly).toBeCloseTo(expected, 2);
});

/* -------- prime exceptionnelle ----------------------------------------- */
it("intègre la prime exceptionnelle dans l'annuel", () => {
  const res = convert({
    amount: 3000,
    unit: "monthly",
    direction: "brut",
    status: "CADRE",
    prime: 4000,
  });
  expect(res.brut.yearly).toBe(40000);
});
