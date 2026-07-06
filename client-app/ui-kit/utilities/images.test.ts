import { describe, it, expect } from "vitest";
import { getIconUrl } from "./images";

describe("getIconUrl", () => {
  it("defaults to the solid folder (masks/silhouettes need fill)", () => {
    expect(getIconUrl("credit-card")).toBe(getIconUrl("credit-card", "solid"));
  });

  it("resolves the outline folder when asked", () => {
    expect(getIconUrl("credit-card", "outline")).not.toBe(getIconUrl("credit-card", "solid"));
  });
});
