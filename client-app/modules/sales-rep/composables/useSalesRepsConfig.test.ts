import { describe, expect, it } from "vitest";
import { isSalesRepsEnabled, salesRepRoleName } from "./useSalesRepsConfig";

describe("useSalesRepsConfig (mock)", () => {
  it("is enabled and returns a non-empty role name", () => {
    expect(isSalesRepsEnabled()).toBe(true);
    expect(salesRepRoleName().length).toBeGreaterThan(0);
  });
});
