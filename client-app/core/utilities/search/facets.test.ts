import { describe, it, expect } from "vitest";
import { getFilterExpressionFromFacetRange } from "@/core/utilities";

const over30 = {
  from: 30,
  to: 0,
  includeFrom: true,
  includeTo: false,
};

const over100 = {
  from: 100,
  to: 0,
  includeFrom: true,
  includeTo: false,
};

const from30To40 = {
  from: 30,
  to: 40,
  includeFrom: true,
  includeTo: false,
};

const zeroTo10 = {
  from: 0,
  to: 10,
  includeFrom: false,
  includeTo: false,
};

describe("getFilterExpressionFromFacetRange", () => {
  it("NOT includes 'to' if it zero", () => {
    expect(getFilterExpressionFromFacetRange(over30)).toEqual("[30 TO)");
    expect(getFilterExpressionFromFacetRange(over100)).toEqual("[100 TO)");
  });

  it("includes 'from' and 'to'", () => {
    expect(getFilterExpressionFromFacetRange(from30To40)).toEqual("[30 TO 40)");
  });

  it("includes 'from' if from is zero", () => {
    expect(getFilterExpressionFromFacetRange(zeroTo10)).toEqual("(0 TO 10)");
  });
});
