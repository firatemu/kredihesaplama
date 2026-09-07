/**
 * Rate conversion utilities.
 *
 * Inputs and outputs are *decimal rates* (e.g. 0.0499 = %4.99 aylık).
 * UI-facing helpers convert from percent (4.99) to decimal (0.0499).
 */
import type { RateType } from "../types";

export interface RateConversionInput {
  /** Rate as percentage value (e.g. 4.99 for %4.99). */
  rate: number;
  type: RateType;
}

/**
 * Convert any rate type to a decimal *monthly* rate.
 *
 * Monthly   : r / 100
 * Annual Nominal   : (r / 100) / 12
 * Annual Effective : (1 + r/100)^(1/12) - 1
 */
export function toMonthlyRate({
  rate,
  type,
}: RateConversionInput): number {
  if (!Number.isFinite(rate) || rate < 0) return 0;
  const r = rate / 100;
  switch (type) {
    case "monthly":
      return r;
    case "annual_nominal":
      return r / 12;
    case "annual_effective":
      // (1 + annual)^(1/12) - 1
      return Math.pow(1 + r, 1 / 12) - 1;
    default:
      return 0;
  }
}

/**
 * Effective periodic rate including KKDF and BSMV.
 * Formula: r * (1 + KKDF + BSMV) where KKDF/BSMV are decimals.
 *
 * Reference example: aylık %4.99 + KKDF %15 + BSMV %15 -> ~0.06487.
 */
export function effectivePeriodicRate(
  monthlyRateDecimal: number,
  kkdfDecimal: number,
  bsmvDecimal: number
): number {
  return monthlyRateDecimal * (1 + kkdfDecimal + bsmvDecimal);
}

/**
 * Annual effective cost from a monthly effective rate using compound
 * interest (12 compounding periods per year).
 *
 * (1 + r_monthly)^12 - 1
 */
export function annualEffectiveRateFromMonthly(monthlyRate: number): number {
  return Math.pow(1 + monthlyRate, 12) - 1;
}

/** Convert percent value to decimal (e.g. 15 -> 0.15). */
export function percentToDecimal(percent: number): number {
  if (!Number.isFinite(percent)) return 0;
  return percent / 100;
}

/** Convert decimal to percent value (e.g. 0.0499 -> 4.99). */
export function decimalToPercent(decimal: number): number {
  return decimal * 100;
}