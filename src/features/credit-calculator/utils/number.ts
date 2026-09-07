/**
 * Numerical helpers used by the credit calculator.
 * Rounding strategy: high precision internally, 2 decimals at presentation.
 */

/** Currency rounding using epsilon to avoid float drift. */
export function roundCurrency(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Clamp a number between min and max (inclusive). */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/** True when value is a safe non-negative finite number. */
export function isNonNegativeFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/** True when value is a safe strictly positive finite number. */
export function isPositiveFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/** True when value is a safe non-negative finite integer. */
export function isNonNegativeInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    Number.isInteger(value)
  );
}

/** Returns the absolute value (rounded for currency). */
export function absRounded(value: number): number {
  return roundCurrency(Math.abs(value));
}