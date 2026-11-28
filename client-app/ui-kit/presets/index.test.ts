// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { darkPresets, presets, presetStyles } from "./index";

const KIT_DIR = new URL("../", import.meta.url);

// The colour names the kit's Sass loops go over (`$colors`).
const COLOR_NAMES = "(?:primary|secondary|accent|neutral|success|danger|info|warning)";

// Every `--color-vc-*` the kit reads; `#{$color}` in a Sass loop stands for one colour name.
const kitColorReads = readdirSync(KIT_DIR, { recursive: true, encoding: "utf-8" })
  .filter((file) => /\.(vue|scss)$/.test(file))
  .flatMap((file) => readFileSync(new URL(file, KIT_DIR), "utf-8").match(/--color-vc-[\w#{}$-]+/g) ?? [])
  .map((name) => new RegExp(`^${name.replaceAll("#{$color}", COLOR_NAMES)}$`));

describe("presetStyles", () => {
  it("is keyed by preset name, like presets", () => {
    expect(Object.keys(presetStyles)).toEqual(["paprika"]);
  });
});

describe("presets' kit keys", () => {
  it.each(Object.entries({ ...presets, ...prefixed("dark ", darkPresets) }))(
    "%s sets only tokens the kit reads",
    (_, preset) => {
      const unread = Object.keys(preset)
        .filter((key) => key.startsWith("color_vc_"))
        .map((key) => `--${key.replaceAll("_", "-")}`)
        .filter((name) => !kitColorReads.some((read) => read.test(name)));

      expect(unread).toEqual([]);
    },
  );
});

function prefixed<T>(prefix: string, record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [prefix + key, value]));
}
