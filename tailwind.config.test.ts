// @vitest-environment node
import { fileURLToPath } from "node:url";
import loadConfig from "tailwindcss/loadConfig.js";
import { describe, expect, it } from "vitest";

describe("tailwind.config.ts", () => {
  it("only extends the ui-kit preset's theme", () => {
    // A key set directly under `theme` replaces the preset's whole scale, so the theme and ui-kit drift apart.
    const { theme } = loadConfig(fileURLToPath(new URL("./tailwind.config.ts", import.meta.url)));

    expect(Object.keys(theme ?? {})).toEqual(["extend"]);
  });
});
