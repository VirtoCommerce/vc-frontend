import { describe, it, expect } from "vitest";
import { shouldUseActualPrice } from "./price";

describe("shouldUseActualPrice", () => {
  it("should return false when listPrice is not provided", () => {
    const result = shouldUseActualPrice(undefined, { amount: 10 });
    expect(result).toBe(false);
  });

  it("should return false when actualPrice is not provided", () => {
    const result = shouldUseActualPrice({ amount: 20 });
    expect(result).toBe(false);
  });

  it("should return false when listPrice is not greater than actualPrice", () => {
    const result = shouldUseActualPrice({ amount: 10 }, { amount: 20 });
    expect(result).toBe(false);
  });

  it("should return true when listPrice is greater than actualPrice", () => {
    const result = shouldUseActualPrice({ amount: 30 }, { amount: 20 });
    expect(result).toBe(true);
  });
});
