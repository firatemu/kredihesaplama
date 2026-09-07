/**
 * Locale-aware formatting helpers (tr-TR).
 *
 * These are pure presentation utilities. All business logic must use the raw
 * numeric values from the calculation engine.
 */

const TR_LOCALE = "tr-TR";

/**
 * Formats a number using Turkish locale with thousands separators and exactly
 * two decimal places.
 *
 *   formatCurrency(1234567.891)  -> "1.234.567,89"
 *   formatCurrency(0)            -> "0,00"
 */
export function formatCurrency(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  if (!Number.isFinite(value)) return "0,00";
  return new Intl.NumberFormat(TR_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/** Formats a percentage value (input is *percent*, e.g. 4.99). */
export function formatPercent(percent: number, fractionDigits = 2): string {
  if (!Number.isFinite(percent)) return "0,00";
  return new Intl.NumberFormat(TR_LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(percent);
}

/** Formats a date as `dd.MM.yyyy` in tr-TR. */
export function formatDate(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(TR_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/** Formats a date for use as an <input type="date"> value (yyyy-MM-dd). */
export function toDateInputValue(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parses an <input type="date"> string (yyyy-MM-dd) into a local Date. */
export function fromDateInputValue(value: string): Date | null {
  if (!value) return null;
  const [yearStr, monthStr, dayStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Parses a Turkish-style currency/number string with thousand separators and
 * decimal commas back to a JS number. Strips currency symbols and whitespace.
 *
 *   parseTrNumber("1.234.567,89") -> 1234567.89
 *   parseTrNumber("100000")       -> 100000
 *   parseTrNumber("4,99")         -> 4.99
 */
export function parseTrNumber(raw: string | number): number {
  if (typeof raw === "number") return raw;
  if (raw == null) return NaN;
  const cleaned = String(raw)
    .replace(/[^\d.,-]/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .trim();
  if (!cleaned) return NaN;
  return Number(cleaned);
}

/**
 * Validates that a parsed tr-number string is finite. Used by input onChange
 * handlers to detect NaN/invalid transitions before storing in form state.
 */
export function isValidTrNumber(raw: string | number): boolean {
  const value = parseTrNumber(raw);
  return Number.isFinite(value);
}

/** Compact currency for KPI values (e.g. "₺1,23M"). */
export function formatCurrencyCompact(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat(TR_LOCALE, {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}