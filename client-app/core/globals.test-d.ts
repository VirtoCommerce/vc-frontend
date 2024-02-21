import { describe, it, expectTypeOf } from "vitest";
import { globals } from "./globals";

describe("globals", () => {
  it("should be readonly", () => {
    expectTypeOf(globals).toMatchTypeOf<Readonly<unknown>>();
  });

  it("should have required fields", () => {
    expectTypeOf(globals).toHaveProperty("storeId").not.toBeUndefined();
    expectTypeOf(globals).toHaveProperty("catalogId").not.toBeUndefined();
    expectTypeOf(globals).toHaveProperty("userId").not.toBeUndefined();
    expectTypeOf(globals).toHaveProperty("currencyCode").not.toBeUndefined();
  });
});
