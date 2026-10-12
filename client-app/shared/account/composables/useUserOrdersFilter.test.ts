import { describe, expect, it } from "vitest";
import { getFilterExpression } from "./useUserOrdersFilter";

describe("getFilterExpression", () => {
  it("escapes quotes and backslashes inside quoted values", () => {
    expect(getFilterExpression("", { statuses: ["New"], customerNames: ['Acme "Best" Inc', "C:\\Corp"] })).toBe(
      String.raw`status:"New" customername:"Acme \"Best\" Inc","C:\\Corp"`,
    );
  });
});
