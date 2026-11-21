// @vitest-environment node
import { describe, expect, it } from "vitest";
import { BREAKPOINTS } from "./client-app/ui-kit/constants/tailwind.js";
import { collectDesignFacts, designFactsDefine, readTokenFallbacks } from "./vite.site-builder-design.js";

describe("readTokenFallbacks", () => {
  it("reads each token's fallback, nested parentheses and commas included", () => {
    const text =
      "var(--vc-base-font-family, Lato, sans-serif) var(--vc-shadow-md-1, 0 4px 6px 0 rgb(from var(--color-x) r g b / 0.1))";

    expect(readTokenFallbacks(text)).toEqual([
      ["--vc-base-font-family", "Lato, sans-serif"],
      ["--vc-shadow-md-1", "0 4px 6px 0 rgb(from var(--color-x) r g b / 0.1)"],
    ]);
  });
});

describe("collectDesignFacts", () => {
  const facts = collectDesignFacts();

  it("takes the breakpoints and the content width of the built-in sections from the storefront's constants", () => {
    expect(facts.breakpoints).toEqual(BREAKPOINTS);
    expect(facts.containerMaxWidth).toBe(BREAKPOINTS.xl);
  });

  it("lists the type, radius, shadow and heading tokens by variable name, with the value classic falls back to", () => {
    expect(facts.tokens).toMatchObject({
      "--vc-base-font-family": { fallback: "Lato, sans-serif" },
      "--vc-heading-font-family": { fallback: "inherit" },
      "--vc-heading-font-weight": { fallback: "inherit" },
      "--vc-font-size-2xl": { fallback: "1.5rem" },
      "--vc-line-height-2xl": { fallback: "2rem" },
      "--vc-radius": { fallback: "0.5rem" },
      "--vc-radius-md": { fallback: "0.375rem" },
      "--vc-shadow-md-2": { fallback: expect.stringContaining("rgb(from var(--color-additional-950)") },
    });
    expect(Object.values(facts.tokens).every(({ description }) => description.length > 0)).toBe(true);
  });

  it("leaves out the tokens of single components", () => {
    expect(Object.keys(facts.tokens).filter((name) => /button|input|card/.test(name))).toEqual([]);
  });
});

describe("designFactsDefine", () => {
  it("inlines the facts as JSON", () => {
    expect(JSON.parse(designFactsDefine().__SB_DESIGN_FACTS__)).toEqual(collectDesignFacts());
  });
});
