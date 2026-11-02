// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { findImportant, importantSources } from "./check-css-important.js";

function found(file: string, source: string): [number, string][] {
  return findImportant(file, source).map(({ line, text }) => [line, text]);
}

describe("check-css-important", () => {
  describe("styles", () => {
    it("reports !important in every form, at its line", () => {
      const scss = [
        ".a {",
        "  color: red !important;",
        "  margin: 0 #{!important};",
        "  padding: 0 ! IMPORTANT;",
        "  @apply mt-4 !important;",
        "  @apply flex !mt-4 lg:!hidden;",
        "  @include size(1px !important);",
        "}",
      ].join("\n");

      expect(found("a.scss", scss)).toEqual([
        [2, "!important"],
        [3, "!important"],
        [4, "! IMPORTANT"],
        [5, "!important"],
        [6, "!mt-4"],
        [6, "lg:!hidden"],
        [7, "!important"],
      ]);
    });

    it("ignores comments and Sass flags", () => {
      const scss = [
        "// color: red !important;",
        "/* @apply !mt-4; */",
        "$gap: 1rem !default;",
        "$size: 2px !global;",
        ".a { color: red; /* !important */ @extend .b !optional; }",
      ].join("\n");

      expect(found("a.scss", scss)).toEqual([]);
    });
  });

  describe("vue", () => {
    it("reports class lists, inline styles, bindings, interpolations, script and style blocks", () => {
      const sfc = [
        "<template>",
        '  <div class="flex !mt-4" style="color: red !important">',
        "    <VcModal",
        '      content-class="[&>*]:!p-0 !w-[calc(100%-1rem)]"',
        "      :class=\"{ 'md:!-mx-2': open }\"",
        "    />",
        "    {{ open ? '!mt-2' : '' }}",
        "  </div>",
        "</template>",
        '<script setup lang="ts">',
        'const classes = "!px-2";',
        'el.style.setProperty("color", "red", "important");',
        "</script>",
        '<style lang="scss">',
        ".a {",
        "  color: red !important;",
        "}",
        "</style>",
      ].join("\n");

      expect(found("a.vue", sfc)).toEqual([
        [2, "!mt-4"],
        [2, "!important"],
        [4, "[&>*]:!p-0"],
        [4, "!w-[calc(100%-1rem)]"],
        [5, "md:!-mx-2"],
        [7, "!mt-2"],
        [11, "!px-2"],
        [12, 'setProperty(…, "important")'],
        [16, "!important"],
      ]);
    });

    it("ignores negation, comments and text", () => {
      const sfc = [
        "<template>",
        '  <!-- !important, class="!mt-4" -->',
        '  <div v-if="!open" :disabled="!items[i]" :title="!isMobile ? a : b">',
        "    Never use !important",
        "  </div>",
        "</template>",
        '<script setup lang="ts">',
        "// !important, '!mt-4'",
        "/* !important */",
        "const isClosed = !open && open !== false;",
        'const isImage = text.startsWith("![");',
        'const template = `<div v-if="!checked[i]">`;',
        "</script>",
      ].join("\n");

      expect(found("a.vue", sfc)).toEqual([]);
    });
  });

  describe("html", () => {
    it("reports index.html styles, scripts and classes at their lines", () => {
      const html = [
        "<!doctype html>",
        "<html>",
        "  <head>",
        "    <style>",
        "      .a { color: red !important; }",
        "    </style>",
        "    <script>",
        "      // !important",
        '      document.body.style.cssText = "color: red !important";',
        "    </script>",
        "  </head>",
        '  <body class="!p-0"></body>',
        "</html>",
      ].join("\n");

      expect(found("index.html", html)).toEqual([
        [5, "!important"],
        [9, "!important"],
        [12, "!p-0"],
      ]);
    });
  });

  describe("ts", () => {
    it("reports string and template literals, not comments", () => {
      const code = ["// !important", 'const a = "lg:!hidden";', "const b = `", "  flex", "  ${c} !important`;"].join(
        "\n",
      );

      expect(found("a.ts", code)).toEqual([
        [2, "lg:!hidden"],
        [5, "!important"],
      ]);
    });
  });

  describe("importantSources", () => {
    let root: string;

    afterEach(() => {
      rmSync(root, { recursive: true, force: true });
    });

    it("skips _custom.scss, Markdown and locale files", () => {
      root = mkdtempSync(path.join(tmpdir(), "important-"));

      for (const file of [
        "index.html",
        "client-app/a.vue",
        "client-app/assets/styles/_custom.scss",
        "client-app/assets/styles/main.scss",
        "client-app/README.md",
        "client-app/locales/en.json",
      ]) {
        mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
        writeFileSync(path.join(root, file), "");
      }

      expect(importantSources(root)).toEqual(["client-app/a.vue", "client-app/assets/styles/main.scss", "index.html"]);
    });

    it("keeps only the checked files of those passed, absolute or relative", () => {
      root = mkdtempSync(path.join(tmpdir(), "important-"));

      for (const file of ["client-app/a.vue", "client-app/b.vue", "client-app/assets/styles/_custom.scss", "x.ts"]) {
        mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
        writeFileSync(path.join(root, file), "");
      }

      expect(
        importantSources(root, [
          path.join(root, "client-app/a.vue"),
          "client-app/assets/styles/_custom.scss",
          path.join(root, "x.ts"),
        ]),
      ).toEqual(["client-app/a.vue"]);
    });
  });
});
