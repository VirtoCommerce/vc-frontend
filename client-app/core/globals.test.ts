import { describe, it, expect } from "vitest";
import { globals, setGlobals } from "./globals";

describe("setGlobals", () => {
  it("should set global variables", () => {
    const globalVariables = {
      storeId: "B2B-store",
      userId: "user1",
    };

    setGlobals(globalVariables);

    expect(globals).toEqual(globalVariables);
  });

  it("should overwrite existing global variables", () => {
    const globalVariables = {
      storeId: "Electronics",
      userId: "user2",
    };

    setGlobals(globalVariables);

    expect(globals).toEqual(globalVariables);
  });
});
