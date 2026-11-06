// @vitest-environment node
import { describe, expect, it } from "vitest";
import { themeSnapshotPlugin } from "./vite.page-builder.js";
import type { IndexHtmlTransformHook, Plugin } from "vite";

const INDEX_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Store</title>
  </head>
</html>`;

function transformIndexHtml(plugin: Plugin, html = INDEX_HTML): string {
  const { handler } = plugin.transformIndexHtml as { handler: IndexHtmlTransformHook };
  return handler.call({} as ThisParameterType<IndexHtmlTransformHook>, html, {
    path: "/index.html",
    filename: "index.html",
  }) as string;
}

describe("themeSnapshotPlugin", () => {
  it("leaves index.html as it is with the theme config as shipped", () => {
    expect(themeSnapshotPlugin()).toEqual([]);
  });

  it.each([{}, { new_page_builder_enabled: false }, { new_page_builder_enabled: "true" }])(
    "adds nothing when the theme settings are %j",
    (settings) => {
      expect(themeSnapshotPlugin({}, settings)).toEqual([]);
    },
  );

  it("puts the snapshot request right after the charset declaration, kept from Rocket Loader", () => {
    const [plugin] = themeSnapshotPlugin({ devDomain: "backend.example.com" }, { new_page_builder_enabled: true });
    const html = transformIndexHtml(plugin as Plugin);
    const script = html.slice(html.indexOf("<script"), html.indexOf("</script>"));

    expect(html.indexOf('<meta charset="UTF-8" />')).toBeLessThan(1024);
    expect(html.indexOf("<script")).toBeGreaterThan(html.indexOf("<meta charset"));
    expect(html.indexOf("<script")).toBeLessThan(html.indexOf("<title>"));
    expect(script).toContain('data-cfasync="false"');
    expect(script).toContain('"domain":"backend.example.com"');
    expect(script).toContain("query ThemeSnapshot");
  });

  it("puts the snapshot request first in a head without a charset declaration", () => {
    const [plugin] = themeSnapshotPlugin({}, { new_page_builder_enabled: true });
    const html = transformIndexHtml(plugin as Plugin, "<html><head><title>Store</title></head></html>");

    expect(html.indexOf("<script")).toBe("<html><head>\n    ".length);
  });
});
