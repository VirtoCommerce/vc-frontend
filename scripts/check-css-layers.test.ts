// @vitest-environment node
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { checkCssLayers, linkedStylesheets } from "./check-css-layers.js";

const require = createRequire(import.meta.url);
const { parseLayerOrder } = require("../postcss.sfc-layers.cjs") as {
  parseLayerOrder: (source: string, file: string) => string[];
};

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const LAYERS_FILE = "client-app/assets/styles/_layers.scss";
const LAYERS = "@layer theme, base, vc;\n@layer vc.kit, vc.app;";
const ORDER = "@layer theme, base, vc; @layer vc.kit, vc.app;";
const FIRST = "dist/assets/index.css";
const CHUNK = "dist/assets/chunk.css";

function check(sheets: Record<string, string>, loadOrder = [FIRST], layersSource = LAYERS) {
  return checkCssLayers({
    layersSource,
    stylesheets: new Map(Object.entries(sheets)),
    loadOrder,
    indexFile: "build/index.html",
  });
}

describe("check-css-layers", () => {
  describe("checkCssLayers", () => {
    it("passes a first sheet that states the declared order, and takes the order from it", () => {
      expect(check({ [FIRST]: `${ORDER} @layer vc.kit { .a { color: red; } }` })).toEqual({
        errors: [],
        firstLayered: FIRST,
      });
    });

    it("passes the real _layers.scss stated as the first sheet", () => {
      const source = readFileSync(path.join(ROOT, LAYERS_FILE), "utf-8");
      const statements = parseLayerOrder(source, LAYERS_FILE).map((names) => `@layer ${names};`);

      expect(check({ [FIRST]: statements.join("\n") }, [FIRST], source).errors).toEqual([]);
    });

    it("skips linked sheets without layers and leaves a later chunk's order alone", () => {
      const plain = "dist/assets/plain.css";

      expect(
        check(
          { [plain]: ".a { color: red; }", [FIRST]: ORDER, [CHUNK]: "@layer vc.app { .b {} } @layer vc.kit { .c {} }" },
          [plain, FIRST],
        ),
      ).toEqual({ errors: [], firstLayered: FIRST });
    });

    it.each([
      ["a block", "@layer vc.extra { .a {} }"],
      ["a statement", "@layer vc.kit, vc.extra;"],
      ["an import", '@import url("x.css") layer(vc.extra);'],
    ])("rejects an undeclared layer name in %s", (_, css) => {
      expect(check({ [FIRST]: ORDER, [CHUNK]: css }).errors).toEqual([
        `${CHUNK}: layer "vc.extra" is not declared in ${LAYERS_FILE}`,
      ]);
    });

    it.each([
      ["a block", "@layer { .a {} }"],
      ["an import", '@import "x.css" layer;'],
      ["an import with empty parentheses", '@import "x.css" layer();'],
    ])("rejects an anonymous layer in %s", (_, css) => {
      expect(check({ [FIRST]: ORDER, [CHUNK]: css }).errors).toEqual([
        `${CHUNK}: an anonymous layer is not in the declared order`,
      ]);
    });

    it("rejects a declared name the first layered sheet does not place", () => {
      expect(check({ [FIRST]: "@layer theme, base, vc; @layer vc.kit;", [CHUNK]: "@layer vc.app {}" }).errors).toEqual([
        `${FIRST}: does not place "vc.app"; a later stylesheet would append it out of order`,
      ]);
    });

    it.each([
      ["a statement", "@layer theme, base, vc; @layer vc.app, vc.kit;"],
      ["blocks", "@layer theme, base, vc; @layer vc.app {} @layer vc.kit {}"],
      ["imports", '@layer theme, base, vc; @import "a.css" layer(vc.app); @import "k.css" layer(vc.kit);'],
      ["nested blocks", "@layer theme, base; @layer vc { @layer app {} @layer kit {} }"],
    ])("rejects siblings out of the declared order in %s", (_, css) => {
      expect(check({ [FIRST]: css }).errors).toEqual([
        `${FIRST}: layers under "vc" appear as vc.app, vc.kit; declared: vc.kit, vc.app`,
      ]);
    });

    it("rejects a first sheet that does not start with the first declared name", () => {
      expect(check({ [FIRST]: "@layer base, theme, vc; @layer vc.kit, vc.app;" }).errors).toEqual([
        `${FIRST}: layers under "(top)" appear as base, theme, vc; declared: theme, base, vc`,
        `${FIRST}: the first stylesheet that declares layers must start with "theme"`,
      ]);
    });

    it.each([
      ["no linked sheet declares layers", [FIRST]],
      ["nothing is linked", []],
      ["the linked sheet is not in the build", ["dist/assets/missing.css"]],
    ])("rejects a build where %s", (_, loadOrder) => {
      expect(check({ [FIRST]: ".a {}", [CHUNK]: ORDER }, loadOrder)).toEqual({
        errors: ["build/index.html: no linked stylesheet declares the layer order"],
      });
    });
  });

  describe("linkedStylesheets", () => {
    it("returns the root-relative stylesheets in load order, under the build directory", () => {
      const html = [
        '<link rel="stylesheet" href="https://cdn.example.com/x.css">',
        '<link rel="stylesheet" crossorigin href="/assets/b.css">',
        '<link rel="preload" href="/assets/font.woff2">',
        "<link rel=stylesheet href=/assets/a.css>",
        '<link rel="stylesheet" href="//cdn.example.com/y.css">',
      ].join("\n");

      expect(linkedStylesheets(html, "dist")).toEqual([
        path.join("dist", "assets/b.css"),
        path.join("dist", "assets/a.css"),
      ]);
    });
  });
});
