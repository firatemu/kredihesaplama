/**
 * Date utilities for credit payment schedules.
 * Robust against month-end edge cases (e.g. Jan 31 → Feb 28/29).
 */
import { addMonths } from "date-fns";

/**
 * Advances the given date by `months` keeping the original day of month,
 * clamping to the last valid day when the target month is shorter.
 *
 * Examples:
 *   addMonthsClamped(2027-01-31, 1) -> 2027-02-28
 *   addMonthsClamped(2027-01-31, 3) -> 2027-04-30
 */
export function addMonthsClamped(date: Date, months: number): Date {
  const start = new Date(date.getTime());
  const desiredDay = start.getDate();

  // First compute a safe anchor using date-fns (handles overflow).
  const anchored = addMonths(start, months);

  const targetYear = anchored.getFullYear();
  const targetMonth = anchored.getMonth();

  // Days in the target month
  const daysInTarget = new Date(targetYear, targetMonth + 1, 0).getDate();

  const day = Math.min(desiredDay, daysInTarget);

  return new Date(targetYear, targetMonth, day, 0, 0, 0, 0);
}