import { describe, expect, it } from "vitest";
import { type Input, type Output } from "./convert";

// TODO: Importer la vraie fonction une fois créée
const convert = (input: Input): Output => {
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
  };
};

describe("convert", () => {
  it("convertit brut vers net (CDI, horaire)", () => {
    const input: Input = {
      amount: 15,
      unit: "hourly",
      direction: "brut",
      status: "CDI",
    };

    const result = convert(input);

    expect(result.net.hourly).toBeCloseTo(11.7, 2);
    expect(result.brut.hourly).toBe(15);
  });

  it("convertit net vers brut (CDI, mensuel)", () => {
    const input: Input = {
      amount: 2000,
      unit: "monthly",
      direction: "net",
      status: "CDI",
    };

    const result = convert(input);

    expect(result.brut.monthly).toBeCloseTo(2440, 2);
    expect(result.net.monthly).toBe(2000);
  });
});
