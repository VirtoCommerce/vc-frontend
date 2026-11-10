import { describe, expect, it, vi } from "vitest";
import { useHeaderCountLabel } from "./useHeaderCountLabel";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params: Record<string, unknown>) => `${key} ${JSON.stringify(params)}`,
    n: (value: number) => `n(${value})`,
  }),
}));

describe("useHeaderCountLabel", () => {
  const { getCountLabel, getCountAriaLabel } = useHeaderCountLabel();

  it("returns the bare title when there is nothing to count", () => {
    expect(getCountLabel("Cart", 0)).toBe("Cart");
    expect(getCountLabel("Cart")).toBe("Cart");
  });

  it("puts the full locale-formatted count into the label, not the 99+ ceiling", () => {
    expect(getCountLabel("Cart", 1543)).toBe('shared.layout.header.link_with_count {"title":"Cart","count":"n(1543)"}');
  });

  it("does not build a label without a title to name the control", () => {
    expect(getCountLabel(undefined, 5)).toBeUndefined();
  });

  it("leaves controls with visible text unlabelled until there is a count", () => {
    expect(getCountAriaLabel("Cart", 0)).toBeUndefined();
    expect(getCountAriaLabel("Cart", 5)).toBe('shared.layout.header.link_with_count {"title":"Cart","count":"n(5)"}');
  });
});
