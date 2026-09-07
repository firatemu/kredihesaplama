import { describe, expect, it } from "vitest";
import {
  clamp,
  isNonNegativeFinite,
  isPositiveFinite,
  roundCurrency,
} from "./number";

describe("roundCurrency", () => {
  it("rounds to 2 decimals", () => {
    expect(roundCurrency(1.005)).toBeCloseTo(1.01, 2);
  });

  it("handles NaN -> 0", () => {
    expect(roundCurrency(NaN)).toBe(0);
  });

  it("handles Infinity -> 0", () => {
    expect(roundCurrency(Infinity)).toBe(0);
  });

  it("rounds negative values", () => {
    expect(roundCurrency(-1.236)).toBeCloseTo(-1.24, 2);
  });
});

describe("clamp", () => {
  it("clamps below min", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("clamps above max", () => {
    expect(clamp(50, 0, 10)).toBe(10);
  });

  it("keeps in-range value", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("NaN -> min", () => {
    expect(clamp(NaN, 0, 10)).toBe(0);
  });
});

describe("isNonNegativeFinite / isPositiveFinite", () => {
  it("accepts positive finite numbers", () => {
    expect(isPositiveFinite(1.5)).toBe(true);
    expect(isNonNegativeFinite(0)).toBe(true);
  });

  it("rejects NaN/Infinity/negative", () => {
    expect(isPositiveFinite(NaN)).toBe(false);
    expect(isPositiveFinite(Infinity)).toBe(false);
    expect(isPositiveFinite(0)).toBe(false);
    expect(isNonNegativeFinite(-1)).toBe(false);
  });

  it("rejects non-numbers", () => {
    expect(isPositiveFinite("1")).toBe(false);
    expect(isNonNegativeFinite(null)).toBe(false);
  });
});