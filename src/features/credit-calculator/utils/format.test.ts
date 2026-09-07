import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatDate,
  fromDateInputValue,
  parseTrNumber,
  toDateInputValue,
} from "./format";

describe("formatCurrency", () => {
  it("formats with Turkish thousand separators", () => {
    expect(formatCurrency(1234567.89)).toBe("1.234.567,89");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("0,00");
  });

  it("handles NaN", () => {
    expect(formatCurrency(NaN)).toBe("0,00");
  });

  it("handles negatives", () => {
    expect(formatCurrency(-500)).toBe("-500,00");
  });
});

describe("formatDate", () => {
  it("formats dd.MM.yyyy", () => {
    const result = formatDate(new Date(2026, 9, 7));
    expect(result).toMatch(/07\.10\.2026/);
  });

  it("handles invalid dates", () => {
    expect(formatDate(new Date("not a date"))).toBe("-");
  });
});

describe("parseTrNumber", () => {
  it("parses dotted numbers (TR thousands)", () => {
    expect(parseTrNumber("1.234.567,89")).toBeCloseTo(1234567.89);
  });

  it("parses comma decimal", () => {
    expect(parseTrNumber("4,99")).toBeCloseTo(4.99);
  });

  it("parses plain integer", () => {
    expect(parseTrNumber("100000")).toBe(100000);
  });

  it("returns NaN for invalid", () => {
    expect(Number.isNaN(parseTrNumber(""))).toBe(true);
    expect(Number.isNaN(parseTrNumber("abc"))).toBe(true);
  });
});

describe("date input helpers", () => {
  it("round-trip yyyy-MM-dd", () => {
    const d = new Date(2026, 9, 7);
    expect(toDateInputValue(d)).toBe("2026-10-07");
    expect(fromDateInputValue("2026-10-07")?.getTime()).toBe(d.getTime());
  });

  it("returns null for empty input", () => {
    expect(fromDateInputValue("")).toBeNull();
  });
});