// @vitest-environment node
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import postcss from "postcss";
import { describe, expect, it } from "vitest";
import type { PluginCreator } from "postcss";

const require = createRequire(import.meta.url);
const sfcLayers = require("./postcss.sfc-layers.cjs") as PluginCreator<void> & {
  parseLayerOrder: (source: string, file: string) => string[];
};

const ROOT = "/repo/client-app";
const CSS = '@charset "utf-8"; @import "a.css"; .x { color: red; } @media print { .y { margin: 0; } }';

const ORDER = readFileSync("client-app/assets/styles/_layers.scss", "utf-8")
  .match(/^@layer [^{;]+;/gm)!
  .join("")
  .replaceAll(/\s+/g, "");

function run(from: string, css = CSS): string {
  return postcss([sfcLayers()]).process(css, { from }).css.replaceAll(/\s+/g, "");
}

describe("postcss.sfc-layers", () => {
  it("puts a ui-kit SFC style into vc.kit", () => {
    expect(run(`${ROOT}/ui-kit/components/atoms/a/vc-a.vue?vue&type=style&index=0&lang.scss`)).toBe(
      `@charset"utf-8";@import"a.css";${ORDER}@layervc.kit{.x{color:red;}@mediaprint{.y{margin:0;}}}`,
    );
  });

  it("puts any other SFC style into vc.app", () => {
    expect(run(`${ROOT}/shared/catalog/components/b.vue?vue&type=style&index=0&scoped=1a2b&lang.scss`)).toContain(
      "@layervc.app{",
    );
  });

  it("restates the declared layer order right before its layer, so a chunk loaded first cannot reorder it", () => {
    expect(ORDER).toContain("@layertheme,base,plugins-vendor,vc,components,plugins,utilities;");
    expect(run(`${ROOT}/pages/c.vue?vue&type=style&index=0&lang.scss`)).toContain(`${ORDER}@layervc.app{`);
  });

  it("leaves App.vue alone", () => {
    expect(run(`${ROOT}/App.vue?vue&type=style&index=0&lang.scss`)).toBe(CSS.replaceAll(/\s+/g, ""));
  });

  it("leaves entry stylesheets alone", () => {
    expect(run(`${ROOT}/ui-kit/components/molecules/slider/nouislider.layer.css`)).toBe(CSS.replaceAll(/\s+/g, ""));
    expect(run(`${ROOT}/assets/styles/main.scss`)).toBe(CSS.replaceAll(/\s+/g, ""));
  });

  it("adds no empty layer when there is nothing to wrap", () => {
    expect(run(`${ROOT}/pages/c.vue?vue&type=style&index=0&lang.css`, '@import "a.css";')).toBe('@import"a.css";');
  });

  it("fails loudly, naming the file, when the layer order cannot be read", () => {
    expect(() => sfcLayers.parseLayerOrder("// emptied by mistake\n", "_layers.scss")).toThrow(
      /_layers\.scss: no layer order found; expected lines of the form "@layer/,
    );
    expect(sfcLayers.parseLayerOrder("@layer a, b;\n@layer a.x;\n", "_layers.scss")).toEqual(["a, b", "a.x"]);
  });
});
