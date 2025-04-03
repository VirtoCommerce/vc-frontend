import { describe, it, expect } from "vitest";
import { getFilterExpression } from "./filter";

describe("getFilterExpression", () => {
  it("should join non-empty filters with spaces", () => {
    const filters = ["filter1", "filter2", "filter3"];
    const result = getFilterExpression(filters);
    expect(result).toBe("filter1 filter2 filter3");
  });

  it("should handle empty array", () => {
    const filters: string[] = [];
    const result = getFilterExpression(filters);
    expect(result).toBe("");
  });

  it("should filter out empty strings and join remaining filters", () => {
    const filters = ["filter1", "", "filter2", "", "filter3"];
    const result = getFilterExpression(filters);
    expect(result).toBe("filter1 filter2 filter3");
  });

  it("should handle array with only empty strings", () => {
    const filters = ["", "", ""];
    const result = getFilterExpression(filters);
    expect(result).toBe("");
  });

  it("should handle array with single filter", () => {
    const filters = ["single-filter"];
    const result = getFilterExpression(filters);
    expect(result).toBe("single-filter");
  });
});
