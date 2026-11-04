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

const ORDER = sfcLayers
  .parseLayerOrder(readFileSync("client-app/assets/styles/_layers.scss", "utf-8"), "_layers.scss")
  .map((names) => `@layer${names.replaceAll(/\s+/g, "")};`)
  .join("");

function run(from: string, css = CSS): string {
  return postcss([sfcLayers()]).process(css, { from }).css.replaceAll(/\s+/g, "");
}

describe("postcss.sfc-layers", () => {
  it("puts a ui-kit SFC style into vc.kit and its print-only media into vc.print", () => {
    expect(run(`${ROOT}/ui-kit/components/atoms/a/vc-a.vue?vue&type=style&index=0&lang.scss`)).toBe(
      `@charset"utf-8";@import"a.css";${ORDER}@layervc.kit{.x{color:red;}}@layervc.print{@mediaprint{.y{margin:0;}}}`,
    );
  });

  it("puts an app SFC's print-only media into vc.print", () => {
    expect(run(`${ROOT}/pages/c.vue?vue&type=style&index=0&lang.scss`)).toContain(
      "@layervc.app{.x{color:red;}}@layervc.print{@mediaprint{.y{margin:0;}}}",
    );
  });

  it("keeps a media query that is not print-only in the component's layer", () => {
    const css = ".x{a:b} @media screen, print {.y{a:b}} @media only print and (min-width: 1px) {.z{a:b}}";
    expect(run(`${ROOT}/pages/c.vue?vue&type=style&index=0&lang.scss`, css)).toContain(
      "@layervc.app{.x{a:b}@mediascreen,print{.y{a:b}}}@layervc.print{@mediaonlyprintand(min-width:1px){.z{a:b}}}",
    );
  });

  it("matches print case-insensitively and leaves a negated print query in the component's layer", () => {
    const css =
      "@media PRINT {.a{a:b}} @media not print {.b{a:b}} @media print, only print and (min-width:1px) {.c{a:b}}";
    expect(run(`${ROOT}/pages/c.vue?vue&type=style&index=0&lang.scss`, css)).toContain(
      "@layervc.app{@medianotprint{.b{a:b}}}@layervc.print{@mediaPRINT{.a{a:b}}@mediaprint,onlyprintand(min-width:1px){.c{a:b}}}",
    );
  });

  it.each(["@media print{.y{a:b}}", "/* x */ @media print{.y{a:b}}"])(
    "adds no component layer when an SFC holds only print rules: %j",
    (css) => {
      const out = run(`${ROOT}/pages/c.vue?vue&type=style&index=0&lang.scss`, css);
      expect(out).not.toContain("@layervc.app{");
      expect(out).toContain("@layervc.print{@mediaprint{.y{a:b}}}");
    },
  );

  it("keeps a comment with the component's rules", () => {
    expect(run(`${ROOT}/pages/c.vue?vue&type=style&index=0&lang.scss`, "/* x */ .x{a:b}")).toContain(
      "@layervc.app{/*x*/.x{a:b}}",
    );
  });

  it("puts any other SFC style into vc.app", () => {
    expect(run(`${ROOT}/shared/catalog/components/b.vue?vue&type=style&index=0&scoped=1a2b&lang.scss`)).toContain(
      "@layervc.app{",
    );
  });

  it("restates the declared layer order right before its layer, so a chunk loaded first cannot reorder it", () => {
    expect(ORDER).toContain("@layertheme,base,plugins-vendor,vc,components,plugins,utilities;");
    expect(ORDER).toContain("@layervc.vendor,vc.kit,vc.app,vc.design,vc.print;");
    expect(run(`${ROOT}/pages/c.vue?vue&type=style&index=0&lang.scss`)).toContain(`${ORDER}@layervc.app{`);
  });

  it("leaves App.vue alone", () => {
    expect(run(`${ROOT}/App.vue?vue&type=style&index=0&lang.scss`)).toBe(CSS.replaceAll(/\s+/g, ""));
  });

  it("leaves entry stylesheets alone", () => {
    expect(run(`${ROOT}/ui-kit/components/molecules/slider/nouislider.layer.css`)).toBe(CSS.replaceAll(/\s+/g, ""));
    expect(run(`${ROOT}/assets/styles/main.scss`)).toBe(CSS.replaceAll(/\s+/g, ""));
  });

  it.each([
    ['@import "a.css";', '@import"a.css";'],
    ['@import "a.css"; /* x */', '@import"a.css";/*x*/'],
  ])("adds no empty layer when there is nothing to wrap: %j", (css, expected) => {
    expect(run(`${ROOT}/pages/c.vue?vue&type=style&index=0&lang.css`, css)).toBe(expected);
  });

  it("fails loudly, naming the file, when the layer order cannot be read", () => {
    expect(() => sfcLayers.parseLayerOrder("// emptied by mistake\n", "_layers.scss")).toThrow(
      /_layers\.scss: no layer order found; expected lines of the form "@layer/,
    );
    expect(sfcLayers.parseLayerOrder("@layer a, b;\n@layer a.x;\n", "_layers.scss")).toEqual(["a, b", "a.x"]);
  });

  it.each(["@layer a,\n  // note\n  b;", "@layer a, /* note */ b;", "@layer a.#{$x};", "@layer a { .x { b: c; } }"])(
    "fails on a comment, interpolation or block in a statement: %j",
    (source) => {
      expect(() => sfcLayers.parseLayerOrder(source, "_layers.scss")).toThrow(
        /_layers\.scss: ".*" must hold layer names only/s,
      );
    },
  );

  it("makes the layer order file a dependency of the module", () => {
    const from = `${ROOT}/pages/c.vue?vue&type=style&index=0&lang.scss`;
    const { messages } = postcss([sfcLayers()]).process(CSS, { from });

    expect(messages).toContainEqual(
      expect.objectContaining({
        type: "dependency",
        file: expect.stringMatching(/client-app\/assets\/styles\/_layers\.scss$/),
      }),
    );
  });
});
