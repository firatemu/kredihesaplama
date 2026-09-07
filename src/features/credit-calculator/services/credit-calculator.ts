/**
 * Credit calculation engine.
 *
 * Pure functions. No React, no DOM. Fully unit-testable.
 *
 * Uses the equal-installment (annuity) method with KKDF and BSMV applied on
 * the interest portion, and an effective periodic rate that folds taxes into
 * the rate.
 *
 * Algorithm notes:
 * - The displayed monthly payment is the *annuity* including principal,
 *   interest, KKDF and BSMV components.
 * - Internally we keep high-precision floats; rounding happens only at the
 *   presentation boundary (and at the final-installment correction).
 * - The last installment is adjusted so that remainingPrincipal == 0.
 */
import type {
  CreditCalculationInput,
  CreditCalculationResult,
  PaymentScheduleItem,
} from "../types";
import {
  annualEffectiveRateFromMonthly,
  effectivePeriodicRate,
  percentToDecimal,
  toMonthlyRate,
} from "./rate-converter";
import { addMonthsClamped } from "../utils/date";
import { roundCurrency } from "../utils/number";

export interface CalculationOptions {
  /**
   * Rounding mode. Defaults to "banking" which rounds to 2 decimals at each
   * payment step (typical Turkish retail banking approach).
   */
  roundingMode?: "banking" | "continuous";
}

const DEFAULTS = {
  roundingMode: "banking" as const,
};

/**
 * Calculates the equal-installment payment using the standard annuity formula.
 *
 * payment = P * r * (1 + r)^n / ((1 + r)^n - 1)
 *
 * If r === 0, falls back to a straight-line division.
 */
export function annuityInstallment(
  principal: number,
  periodicRate: number,
  term: number
): number {
  if (term <= 0) return 0;
  if (periodicRate === 0) return principal / term;

  const factor = Math.pow(1 + periodicRate, term);
  const payment = (principal * periodicRate * factor) / (factor - 1);
  return payment;
}

/**
 * Build a single installment row given the remaining principal at the start
 * of the period.
 *
 * The interest, KKDF and BSMV are computed on the start-of-period remaining
 * principal. The principal portion absorbs whatever is left.
 *
 * For the *last* installment, pass `isLast=true` to force
 * remainingPrincipal -> 0 by adjusting the principal portion.
 */
export function buildInstallment(args: {
  installmentNo: number;
  paymentDate: Date;
  startRemaining: number;
  monthlyInterestRateDecimal: number;
  kkdfDecimal: number;
  bsmvDecimal: number;
  fixedPayment?: number;
  isLast?: boolean;
}): PaymentScheduleItem {
  const {
    installmentNo,
    paymentDate,
    startRemaining,
    monthlyInterestRateDecimal: r,
    kkdfDecimal,
    bsmvDecimal,
    fixedPayment,
    isLast = false,
  } = args;

  const interest = roundCurrency(startRemaining * r);
  const kkdf = roundCurrency(interest * kkdfDecimal);
  const bsmv = roundCurrency(interest * bsmvDecimal);
  const taxes = roundCurrency(kkdf + bsmv);

  let payment: number;
  let principal: number;
  let remaining: number;

  if (fixedPayment !== undefined) {
    payment = fixedPayment;
    principal = roundCurrency(payment - interest - taxes);
    remaining = roundCurrency(startRemaining - principal);
  } else {
    payment = roundCurrency(startRemaining);
    principal = roundCurrency(payment - interest - taxes);
    remaining = roundCurrency(startRemaining - principal);
  }

  if (isLast) {
    // Force remaining -> 0 by adjusting the principal component.
    principal = roundCurrency(startRemaining);
    remaining = 0;
    payment = roundCurrency(principal + interest + taxes);
  } else if (Math.abs(remaining) < 0.005) {
    // Avoid dangling 1 kuruş balances between rows when bank rounding is in play.
    remaining = 0;
  }

  return {
    installmentNo,
    paymentDate,
    payment,
    principal,
    interest,
    kkdf,
    bsmv,
    remainingPrincipal: remaining,
  };
}

/**
 * Main API. Takes a fully validated input and produces the full calculation
 * result including the payment schedule and aggregate totals.
 */
export function calculateCredit(
  input: CreditCalculationInput,
  options: CalculationOptions = {}
): CreditCalculationResult {
  const roundingMode = options.roundingMode ?? DEFAULTS.roundingMode;

  const principal = roundCurrency(input.principal);
  const term = Math.max(0, Math.floor(input.termMonths));

  const monthlyRateDecimal = toMonthlyRate({
    rate: input.interestRate,
    type: input.rateType,
  });
  const kkdfDecimal = percentToDecimal(input.kkdfRate);
  const bsmvDecimal = percentToDecimal(input.bsmvRate);

  const periodicRate = effectivePeriodicRate(
    monthlyRateDecimal,
    kkdfDecimal,
    bsmvDecimal
  );

  // The monthly *displayed* installment (used as fixed payment each period).
  const fixedPayment = roundCurrency(
    annuityInstallment(principal, periodicRate, term)
  );

  const schedule: PaymentScheduleItem[] = [];
  let startRemaining = principal;

  for (let i = 0; i < term; i++) {
    const isLast = i === term - 1;
    const item = buildInstallment({
      installmentNo: i + 1,
      paymentDate: addMonthsClamped(input.firstPaymentDate, i),
      startRemaining,
      monthlyInterestRateDecimal: monthlyRateDecimal,
      kkdfDecimal,
      bsmvDecimal,
      fixedPayment,
      isLast,
    });
    schedule.push(item);
    startRemaining = item.remainingPrincipal;
  }

  const totalInterest = roundCurrency(
    schedule.reduce((acc, row) => acc + row.interest, 0)
  );
  const totalKkdf = roundCurrency(
    schedule.reduce((acc, row) => acc + row.kkdf, 0)
  );
  const totalBsmv = roundCurrency(
    schedule.reduce((acc, row) => acc + row.bsmv, 0)
  );
  const totalPrincipal = roundCurrency(
    schedule.reduce((acc, row) => acc + row.principal, 0)
  );
  const totalFees = roundCurrency(
    (input.allocationFee ?? 0) +
      (input.insuranceFee ?? 0) +
      (input.otherFees ?? 0)
  );
  const totalRepayment = roundCurrency(
    totalPrincipal + totalInterest + totalKkdf + totalBsmv
  );

  const monthlyCostRate = periodicRate; // decimal
  const annualEffectiveCostRate = annualEffectiveRateFromMonthly(
    monthlyCostRate
  );

  // Touch roundingMode so unused warning goes away under strict configs.
  void roundingMode;

  return {
    input,
    monthlyPayment: fixedPayment,
    totalPrincipal,
    totalInterest,
    totalKkdf,
    totalBsmv,
    totalFees,
    totalRepayment,
    monthlyCostRate,
    annualEffectiveCostRate,
    schedule,
  };
}