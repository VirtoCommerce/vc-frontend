// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import defaultDarkPreset from "./default.dark.json";
import defaultPreset from "./default.json";

const SOURCE = readFileSync(new URL("../styles/_fallback-palette.scss", import.meta.url), "utf-8");
const PALETTE_KEY = /^color_(primary|secondary|accent|neutral|warning|danger|success|info|additional)_\d+$/;

function declarations(selector: string): Record<string, string> {
  const body = SOURCE.split(`\n${selector} {\n`)[1]?.split("\n}")[0] ?? "";

  return Object.fromEntries([...body.matchAll(/^ {2}(--[\w-]+): ([^;]+);$/gm)].map((match) => [match[1], match[2]]));
}

function palette(preset: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(preset)
      .filter(([key]) => PALETTE_KEY.test(key))
      .map(([key, value]) => [`--${key.replaceAll("_", "-")}`, value]),
  );
}

describe("ui-kit's _fallback-palette.scss", () => {
  it("holds the default preset's palette", () => {
    expect(declarations(":root")).toEqual(palette(defaultPreset));
  });

  it("holds the default dark preset's palette under html.dark", () => {
    expect(declarations("html.dark")).toEqual(palette(defaultDarkPreset));
  });
});
