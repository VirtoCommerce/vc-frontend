import { describe, expect, it } from "vitest";
import { isSalesRepsEnabled } from "./useSalesRepsConfig";

describe("useSalesRepsConfig (mock)", () => {
  it("is enabled", () => {
    expect(isSalesRepsEnabled()).toBe(true);
  });
});
