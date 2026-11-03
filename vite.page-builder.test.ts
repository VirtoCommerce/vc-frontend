// @vitest-environment node
import { describe, expect, it } from "vitest";
import { themeSnapshotPlugin } from "./vite.page-builder.js";
import type { HtmlTagDescriptor, IndexHtmlTransformHook, Plugin } from "vite";

function transformIndexHtml(plugin: Plugin): HtmlTagDescriptor[] {
  const { handler } = plugin.transformIndexHtml as { handler: IndexHtmlTransformHook };
  return handler.call({} as ThisParameterType<IndexHtmlTransformHook>, "", {
    path: "/index.html",
    filename: "index.html",
  }) as HtmlTagDescriptor[];
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

  it("puts the snapshot request first in the head, kept from Rocket Loader", () => {
    const [plugin] = themeSnapshotPlugin({ devDomain: "backend.example.com" }, { new_page_builder_enabled: true });
    const [tag] = transformIndexHtml(plugin as Plugin);

    expect(tag).toMatchObject({ tag: "script", attrs: { "data-cfasync": "false" }, injectTo: "head-prepend" });
    expect(tag.children).toContain('"domain":"backend.example.com"');
    expect(tag.children).toContain("query ThemeSnapshot");
  });
});
