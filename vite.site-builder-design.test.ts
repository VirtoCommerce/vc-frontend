// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  MAX_DESIGN_ENTRIES,
  MAX_DESIGN_TEXT_LENGTH,
  MAX_ICON_NAME_LENGTH,
  MAX_ICONS,
} from "./client-app/shared/static-content/custom-sections/kit/limits.js";
import { BREAKPOINTS } from "./client-app/ui-kit/constants/tailwind.js";
import { ICON_ALIASES } from "./client-app/ui-kit/utilities/icon-aliases.js";
import {
  collectDesignFacts,
  collectIconElements,
  collectIconNames,
  collectMaskNames,
  designFactsDefine,
  readTokenFallbacks,
} from "./vite.site-builder-design.js";

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
      "--vc-font-weight-bold": { fallback: "700" },
      "--vc-letter-spacing-wide": { fallback: "0.025em" },
    });
    expect(Object.values(facts.tokens).every(({ description }) => description.length > 0)).toBe(true);
  });

  it("stays within the server's caps on the design it takes", () => {
    const texts = [
      facts.containerMaxWidth,
      ...Object.entries(facts.breakpoints).flat(),
      ...Object.entries(facts.tokens).flatMap(([name, { fallback, description }]) => [name, fallback, description]),
    ];

    expect(Math.max(Object.keys(facts.breakpoints).length, Object.keys(facts.tokens).length)).toBeLessThanOrEqual(
      MAX_DESIGN_ENTRIES,
    );
    expect(texts.filter((text) => text.length > MAX_DESIGN_TEXT_LENGTH)).toEqual([]);
  });

  it("leaves out the tokens of single components", () => {
    expect(Object.keys(facts.tokens).filter((name) => /button|input|card/.test(name))).toEqual([]);
  });
});

describe("collectIconNames", () => {
  const names = collectIconNames();

  it("lists the outline set's icons and the legacy names aliased to them, once each, sorted", () => {
    expect(names).toEqual(expect.arrayContaining(["star", "shopping-cart", ...Object.keys(ICON_ALIASES)]));
    expect(new Set(names).size).toBe(names.length);
    expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names);
  });

  it("stays within the server's caps on the icons it takes", () => {
    expect(names.length).toBeLessThanOrEqual(MAX_ICONS);
    expect(names.filter((name) => name.length === 0 || name.length > MAX_ICON_NAME_LENGTH)).toEqual([]);
  });
});

describe("collectMaskNames", () => {
  it("lists the icons VcShape cuts its mask from, sorted, within the server's caps", () => {
    const names = collectMaskNames();

    expect(names).toEqual(expect.arrayContaining(["polygon", "circle-solid", "heart"]));
    expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names);
    expect(names.length).toBeLessThanOrEqual(MAX_ICONS);
    expect(names.filter((name) => name.length === 0 || name.length > MAX_ICON_NAME_LENGTH)).toEqual([]);
  });
});

describe("collectIconElements", () => {
  it("counts the elements of the largest icon the storefront draws, its own svg included", () => {
    const folder = "client-app/ui-kit/icons/outline";
    const counts = readdirSync(folder)
      .filter((file) => file.endsWith(".svg"))
      .map((file) => readFileSync(`${folder}/${file}`, "utf8").match(/<[a-z][\w:-]*/gi)?.length ?? 0);
    const largest = collectIconElements();

    expect(counts).toContain(largest);
    expect(counts.every((count) => count <= largest)).toBe(true);
  });
});

describe("designFactsDefine", () => {
  it("inlines the facts and the icon and mask names as JSON the preview reads as they are", () => {
    const defined = designFactsDefine();
    const facts = JSON.parse(defined.__SB_DESIGN_FACTS__) as ReturnType<typeof collectDesignFacts>;

    expect(Object.keys(defined)).toEqual([
      "__SB_DESIGN_FACTS__",
      "__SB_ICON_NAMES__",
      "__SB_MASK_NAMES__",
      "__SB_ICON_ELEMENTS__",
    ]);
    expect(JSON.parse(defined.__SB_ICON_ELEMENTS__)).toBe(collectIconElements());
    expect(facts.tokens["--vc-radius"]).toEqual({ fallback: "0.5rem", description: expect.any(String) });
    expect(JSON.parse(defined.__SB_ICON_NAMES__)).toEqual(expect.arrayContaining(["star"]));
    expect(JSON.parse(defined.__SB_MASK_NAMES__)).toEqual(collectMaskNames());
  });
});
