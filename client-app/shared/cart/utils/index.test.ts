import { describe, it, expect } from "vitest";
import { isSameCouponCode } from "./index";

describe("isSameCouponCode", () => {
  it.each([
    ["SAVE10", "save10"],
    ["save10", " SAVE10 "],
    [" save10 ", "save10"],
  ])("matches %s and %s", (code, otherCode) => {
    expect(isSameCouponCode(code, otherCode)).toBe(true);
  });

  it("does not match different codes", () => {
    expect(isSameCouponCode("SAVE10", "SAVE20")).toBe(false);
  });

  // Callers rely on this to drop their own `!!code` guards: a card with no code must never be
  // reported as applied, errored or loading.
  it.each([
    [undefined, undefined],
    [undefined, "save10"],
    ["save10", undefined],
    ["", ""],
    ["   ", "   "],
  ])("treats a blank code as matching nothing (%s, %s)", (code, otherCode) => {
    expect(isSameCouponCode(code, otherCode)).toBe(false);
  });
});
