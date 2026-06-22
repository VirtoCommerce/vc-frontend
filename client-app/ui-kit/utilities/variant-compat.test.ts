import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LEGACY_VARIANT_MAP, resolveVariant, resetWarnedPairs } from "./variant-compat";

describe("LEGACY_VARIANT_MAP", () => {
  it("maps each legacy name to its canonical replacement", () => {
    expect(LEGACY_VARIANT_MAP).toEqual({
      "solid-light": "soft",
      "no-border": "surface",
      "no-background": "ghost",
      "outline-dark": "tonal",
    });
  });
});

describe("resolveVariant", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubEnv("DEV", true);
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    resetWarnedPairs();
  });

  afterEach(() => {
    warnSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it("returns canonical names unchanged", () => {
    expect(resolveVariant("VcButton", "solid")).toBe("solid");
    expect(resolveVariant("VcButton", "soft")).toBe("soft");
    expect(resolveVariant("VcButton", "outline")).toBe("outline");
    expect(resolveVariant("VcButton", "surface")).toBe("surface");
    expect(resolveVariant("VcButton", "ghost")).toBe("ghost");
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("maps legacy names to canonical names", () => {
    expect(resolveVariant("VcButton", "solid-light")).toBe("soft");
    expect(resolveVariant("VcButton", "no-border")).toBe("surface");
    expect(resolveVariant("VcButton", "no-background")).toBe("ghost");
    expect(resolveVariant("VcButton", "outline-dark")).toBe("tonal");
  });

  it("emits a dev-only console.warn the first time a legacy name is used", () => {
    resolveVariant("VcButton", "solid-light");
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(/VcButton/);
    expect(warnSpy.mock.calls[0][0]).toMatch(/solid-light/);
    expect(warnSpy.mock.calls[0][0]).toMatch(/soft/);
  });

  it("emits the warning only once per (component, legacy name) pair", () => {
    resolveVariant("VcButton", "solid-light");
    resolveVariant("VcButton", "solid-light");
    resolveVariant("VcButton", "solid-light");
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it("emits separate warnings for different legacy names on the same component", () => {
    resolveVariant("VcButton", "solid-light");
    resolveVariant("VcButton", "no-border");
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });

  it("emits separate warnings for the same legacy name across different components", () => {
    resolveVariant("VcButton", "solid-light");
    resolveVariant("VcChip", "solid-light");
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });

  it("does not warn in production mode", () => {
    vi.stubEnv("DEV", false);
    resolveVariant("VcButton", "solid-light");
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
