import { describe, expect, it } from "vitest";
import { addMonthsClamped } from "./date";

describe("addMonthsClamped", () => {
  it("Jan 31 + 1 -> Feb 28 (non-leap)", () => {
    const result = addMonthsClamped(new Date(2027, 0, 31), 1);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28);
  });

  it("Jan 31 + 1 -> Feb 29 (leap year)", () => {
    const result = addMonthsClamped(new Date(2028, 0, 31), 1);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(29);
  });

  it("Mar 31 + 1 -> Apr 30", () => {
    const result = addMonthsClamped(new Date(2027, 2, 31), 1);
    expect(result.getMonth()).toBe(3);
    expect(result.getDate()).toBe(30);
  });

  it("31 May + 2 -> 31 July (full retention when month is long enough)", () => {
    const result = addMonthsClamped(new Date(2027, 4, 31), 2);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(31);
  });

  it("preserves time", () => {
    const result = addMonthsClamped(new Date(2026, 9, 7), 1);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(10);
    expect(result.getDate()).toBe(7);
  });
});