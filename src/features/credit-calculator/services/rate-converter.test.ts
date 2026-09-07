import { describe, expect, it } from "vitest";
import {
  annualEffectiveRateFromMonthly,
  effectivePeriodicRate,
  percentToDecimal,
  toMonthlyRate,
} from "./rate-converter";

function approx(actual: number, expected: number, tol = 1e-6) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tol);
}

describe("toMonthlyRate", () => {
  it("monthly: r/100", () => {
    approx(toMonthlyRate({ rate: 4.99, type: "monthly" }), 0.0499);
  });

  it("annual nominal: r/100 / 12", () => {
    approx(toMonthlyRate({ rate: 60, type: "annual_nominal" }), 0.05);
  });

  it("annual effective: (1 + r/100)^(1/12) - 1", () => {
    const rate = toMonthlyRate({ rate: 12, type: "annual_effective" });
    approx(rate, Math.pow(1.12, 1 / 12) - 1);
  });

  it("negative rate becomes 0", () => {
    expect(toMonthlyRate({ rate: -5, type: "monthly" })).toBe(0);
  });

  it("non-finite rate becomes 0", () => {
    expect(toMonthlyRate({ rate: NaN, type: "monthly" })).toBe(0);
    expect(toMonthlyRate({ rate: Infinity, type: "monthly" })).toBe(0);
  });
});

describe("effectivePeriodicRate", () => {
  it("r * (1 + KKDF + BSMV)", () => {
    approx(effectivePeriodicRate(0.0499, 0.15, 0.15), 0.06487, 1e-5);
  });

  it("zero KKDF and BSMV -> equals monthly rate", () => {
    approx(effectivePeriodicRate(0.0499, 0, 0), 0.0499);
  });
});

describe("annualEffectiveRateFromMonthly", () => {
  it("compounds 12 times", () => {
    approx(annualEffectiveRateFromMonthly(0.01), Math.pow(1.01, 12) - 1);
  });
});

describe("percentToDecimal", () => {
  it("15 -> 0.15", () => {
    expect(percentToDecimal(15)).toBe(0.15);
  });

  it("non-finite -> 0", () => {
    expect(percentToDecimal(NaN)).toBe(0);
  });
});