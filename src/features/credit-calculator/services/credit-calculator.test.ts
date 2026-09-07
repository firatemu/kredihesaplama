import { describe, expect, it } from "vitest";
import { calculateCredit } from "./credit-calculator";
import type { CreditCalculationInput } from "../types";

const REFERENCE_INPUT: CreditCalculationInput = {
  creditType: "consumer",
  principal: 100_000,
  termMonths: 36,
  interestRate: 4.99,
  rateType: "monthly",
  kkdfRate: 15,
  bsmvRate: 15,
  firstPaymentDate: new Date(2026, 9, 7), // 07.10.2026
};

function approxEq(actual: number, expected: number, tolerance = 0.05) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

describe("calculateCredit - reference scenario", () => {
  const result = calculateCredit(REFERENCE_INPUT);

  it("produces a positive monthly payment", () => {
    expect(result.monthlyPayment).toBeGreaterThan(0);
  });

  it("monthly payment is approximately 7.240,52 TL", () => {
    approxEq(result.monthlyPayment, 7240.52, 0.02);
  });

  it("total repayment is approximately 260.658,56 TL", () => {
    approxEq(result.totalRepayment, 260_658.56, 5);
  });

  it("total principal equals the original principal", () => {
    approxEq(result.totalPrincipal, 100_000, 0.05);
  });

  it("monthly cost rate is approximately %6.487", () => {
    // 0.06487 -> 6.487%
    approxEq(result.monthlyCostRate * 100, 6.487, 0.01);
  });

  it("annual effective cost rate is approximately %112.60", () => {
    approxEq(result.annualEffectiveCostRate * 100, 112.6, 0.5);
  });

  it("first installment principal is approximately 753,52 TL", () => {
    approxEq(result.schedule[0].principal, 753.52, 0.05);
  });

  it("first installment interest is approximately 4.990,00 TL", () => {
    approxEq(result.schedule[0].interest, 4_990.0, 0.02);
  });

  it("first installment KKDF is approximately 748,50 TL", () => {
    approxEq(result.schedule[0].kkdf, 748.5, 0.02);
  });

  it("first installment BSMV is approximately 748,50 TL", () => {
    approxEq(result.schedule[0].bsmv, 748.5, 0.02);
  });

  it("first installment total payment is approximately 7.240,52 TL", () => {
    approxEq(result.schedule[0].payment, 7_240.52, 0.05);
  });

  it("first installment remaining principal is approximately 99.246,48 TL", () => {
    approxEq(result.schedule[0].remainingPrincipal, 99_246.48, 0.5);
  });

  it("schedule has exactly 36 rows", () => {
    expect(result.schedule).toHaveLength(36);
  });

  it("final installment brings remaining principal to 0", () => {
    const last = result.schedule[result.schedule.length - 1];
    expect(Math.abs(last.remainingPrincipal)).toBeLessThan(0.01);
  });

  it("total repayment equals principal + interest + KKDF + BSMV", () => {
    approxEq(
      result.totalRepayment,
      result.totalPrincipal +
        result.totalInterest +
        result.totalKkdf +
        result.totalBsmv,
      0.05
    );
  });

  it("payment dates are spaced monthly", () => {
    for (let i = 1; i < result.schedule.length; i++) {
      const prev = result.schedule[i - 1].paymentDate;
      const cur = result.schedule[i].paymentDate;
      const diff = cur.getTime() - prev.getTime();
      // 28 to 31 days
      const days = diff / (1000 * 60 * 60 * 24);
      expect(days).toBeGreaterThanOrEqual(28);
      expect(days).toBeLessThanOrEqual(31);
    }
  });
});

describe("calculateCredit - zero interest rate", () => {
  const result = calculateCredit({
    ...REFERENCE_INPUT,
    interestRate: 0,
    rateType: "monthly",
    kkdfRate: 0,
    bsmvRate: 0,
  });

  it("monthly payment is principal / term", () => {
    approxEq(result.monthlyPayment, 100_000 / 36, 0.005);
  });

  it("no interest, KKDF or BSMV charged", () => {
    expect(result.totalInterest).toBe(0);
    expect(result.totalKkdf).toBe(0);
    expect(result.totalBsmv).toBe(0);
  });

  it("remaining principal ends at 0", () => {
    const last = result.schedule[result.schedule.length - 1];
    expect(Math.abs(last.remainingPrincipal)).toBeLessThan(0.01);
  });
});

describe("calculateCredit - zero taxes", () => {
  const result = calculateCredit({
    ...REFERENCE_INPUT,
    kkdfRate: 0,
    bsmvRate: 0,
  });

  it("KKDF and BSMV are zero across the schedule", () => {
    expect(result.totalKkdf).toBe(0);
    expect(result.totalBsmv).toBe(0);
  });

  it("monthly cost rate equals monthly interest rate", () => {
    approxEq(result.monthlyCostRate, 0.0499, 0.0001);
  });
});

describe("calculateCredit - 1-month loan", () => {
  const result = calculateCredit({
    ...REFERENCE_INPUT,
    termMonths: 1,
  });

  it("schedule has exactly one row", () => {
    expect(result.schedule).toHaveLength(1);
  });

  it("monthly payment covers principal + interest + taxes", () => {
    const row = result.schedule[0];
    approxEq(row.payment, row.principal + row.interest + row.kkdf + row.bsmv, 0.02);
  });

  it("remaining principal at the end is 0", () => {
    expect(Math.abs(result.schedule[0].remainingPrincipal)).toBeLessThan(0.01);
  });
});

describe("calculateCredit - rate type conversions", () => {
  it("annual nominal rate / 12 equals monthly rate", () => {
    const a = calculateCredit({
      ...REFERENCE_INPUT,
      interestRate: 4.99,
      rateType: "monthly",
    });
    const b = calculateCredit({
      ...REFERENCE_INPUT,
      interestRate: 4.99 * 12, // nominal yearly
      rateType: "annual_nominal",
    });
    // Same monthly interest rate -> totals should be essentially identical.
    approxEq(a.monthlyPayment, b.monthlyPayment, 0.05);
    approxEq(a.totalInterest, b.totalInterest, 1);
  });

  it("annual effective -> monthly produces equivalent totals", () => {
    const monthlyRate = 4.99 / 100;
    const annualEff = (Math.pow(1 + monthlyRate, 12) - 1) * 100;
    const a = calculateCredit({
      ...REFERENCE_INPUT,
      interestRate: 4.99,
      rateType: "monthly",
    });
    const b = calculateCredit({
      ...REFERENCE_INPUT,
      interestRate: annualEff,
      rateType: "annual_effective",
    });
    approxEq(a.monthlyPayment, b.monthlyPayment, 0.05);
  });
});

describe("calculateCredit - month-end date handling", () => {
  it("31 January + 1 month -> last day of February", () => {
    const result = calculateCredit({
      ...REFERENCE_INPUT,
      termMonths: 3,
      firstPaymentDate: new Date(2027, 0, 31),
    });
    expect(result.schedule[1].paymentDate.getMonth()).toBe(1); // Feb (0-indexed)
    expect(result.schedule[1].paymentDate.getDate()).toBeLessThanOrEqual(28);
  });

  it("31 March + 1 month -> 30 April", () => {
    const result = calculateCredit({
      ...REFERENCE_INPUT,
      termMonths: 3,
      firstPaymentDate: new Date(2027, 2, 31),
    });
    expect(result.schedule[1].paymentDate.getMonth()).toBe(3); // April
    expect(result.schedule[1].paymentDate.getDate()).toBe(30);
  });

  it("31 May + 2 months -> 31 July", () => {
    const result = calculateCredit({
      ...REFERENCE_INPUT,
      termMonths: 3,
      firstPaymentDate: new Date(2027, 4, 31),
    });
    expect(result.schedule[1].paymentDate.getMonth()).toBe(5); // June
    expect(result.schedule[1].paymentDate.getDate()).toBe(30);
    expect(result.schedule[2].paymentDate.getMonth()).toBe(6); // July
    expect(result.schedule[2].paymentDate.getDate()).toBe(31);
  });
});

describe("calculateCredit - additional fees", () => {
  it("totalFees reflects sum of additional fees", () => {
    const result = calculateCredit({
      ...REFERENCE_INPUT,
      allocationFee: 1000,
      insuranceFee: 500,
      otherFees: 250,
    });
    expect(result.totalFees).toBe(1750);
  });

  it("additional fees do not alter the installment amount", () => {
    const base = calculateCredit(REFERENCE_INPUT);
    const withFees = calculateCredit({
      ...REFERENCE_INPUT,
      allocationFee: 1000,
    });
    expect(withFees.monthlyPayment).toBe(base.monthlyPayment);
  });
});

describe("calculateCredit - large principal", () => {
  it("handles 125.000.000 TL principal without precision explosions", () => {
    const result = calculateCredit({
      ...REFERENCE_INPUT,
      principal: 125_000_000,
    });
    expect(result.monthlyPayment).toBeGreaterThan(0);
    const last = result.schedule[result.schedule.length - 1];
    expect(Math.abs(last.remainingPrincipal)).toBeLessThan(0.01);
  });
});

describe("calculateCredit - principal sum invariant", () => {
  it("sum of principal components equals initial principal (within 1 TL)", () => {
    const result = calculateCredit(REFERENCE_INPUT);
    approxEq(result.totalPrincipal, result.input.principal, 1);
  });
});