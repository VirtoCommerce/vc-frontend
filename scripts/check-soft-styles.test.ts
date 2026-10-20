// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  checkBlockSelector,
  checkForeignBlocks,
  checkSides,
  checkTokensSelector,
  definedBlocks,
} from "./check-soft-styles.js";
import type { ISideType } from "./check-soft-styles.js";

const SOFT = 'html[data-design="soft"]';

describe("check-soft-styles", () => {
  describe("checkBlockSelector", () => {
    it.each([
      `${SOFT} .vc-button`,
      `${SOFT} .vc-button__icon`,
      `${SOFT}.dark .vc-button--primary:hover`,
      `${SOFT} .vc-button .vc-button__icon::before`,
      `${SOFT} .vc-button:has(.x)`,
    ])("allows %s", (selector) => {
      expect(checkBlockSelector(selector, "vc-button")).toBeNull();
    });

    it.each([
      [`${SOFT} .vc-button > .x`, "does not style .vc-button"],
      [`${SOFT} .vc-button button`, "does not style .vc-button"],
      [`${SOFT} .vc-button *`, "does not style .vc-button"],
      [`${SOFT} .vc-button > :first-child`, "does not style .vc-button"],
      [`${SOFT} .vc-button ~ .other`, "does not style .vc-button"],
      [`${SOFT} .vc-button + .other`, "does not style .vc-button"],
      [`${SOFT} .x:has(.vc-button)`, "does not style .vc-button"],
      [`${SOFT} .x:has(.foo, .vc-button)`, "does not style .vc-button"],
      [`${SOFT} .x:is(.vc-button)`, "does not style .vc-button"],
      [`${SOFT} .vc-buttons`, "does not style .vc-button"],
      [".vc-button", 'must start with html[data-design="soft"]'],
      [`${SOFT}:hover .vc-button`, 'must start with html[data-design="soft"]'],
      [`${SOFT}.foo .vc-button`, 'must start with html[data-design="soft"]'],
      ['body[data-design="soft"] .vc-button', 'must start with html[data-design="soft"]'],
      ['[data-design="soft"] .vc-button', 'must start with html[data-design="soft"]'],
      ['html[data-design="classic"] .vc-button', 'must start with html[data-design="soft"]'],
      [`${SOFT} .vc-button--disabled ${SOFT} .vc-button__icon`, "never matches: html below the first compound"],
      [`${SOFT} .vc-button HTML .vc-button__icon`, "never matches: html below the first compound"],
      [`${SOFT}`, "targets <html> itself"],
    ])("rejects %s", (selector, message) => {
      expect(checkBlockSelector(selector, "vc-button")).toContain(message);
    });
  });

  describe("checkForeignBlocks", () => {
    const blocks = new Map([
      ["vc-button", "ui-kit"],
      ["vc-card", "ui-kit"],
      ["cart-page", "app"],
      ["product-card", "app"],
    ]);

    it.each([
      [`${SOFT} .vc-card .vc-button`, "vc-card", "vc-button"],
      [`${SOFT} .vc-button .vc-card__body`, "vc-button", "vc-card__body"],
      [`${SOFT} .cart-page .vc-button`, "cart-page", "vc-button"],
      [`${SOFT} .cart-page .product-card`, "cart-page", "product-card"],
      [`${SOFT} .cart-page:has(.vc-button)`, "cart-page", "vc-button"],
      [`${SOFT} .cart-page:is(.x, .vc-card)`, "cart-page", "vc-card"],
      [`${SOFT} .cart-page:not(:not(.vc-button))`, "cart-page", "vc-button"],
      [`${SOFT} .cart-page [class~="vc-button"]`, "cart-page", "vc-button"],
      [`${SOFT} .cart-page [class="x vc-button--primary"]`, "cart-page", "vc-button--primary"],
      [`${SOFT} .cart-page [CLASS~="VC-BUTTON" i]`, "cart-page", "vc-button"],
    ])("rejects %s in the file of .%s", (selector, own, named) => {
      expect(checkForeignBlocks(selector, own, blocks)).toContain(`names .${named}, a block of the`);
    });

    it.each([
      `${SOFT} .cart-page [class*="vc-button"]`,
      `${SOFT} .cart-page [class^="vc-"]`,
      `${SOFT} .cart-page [class$="button"]`,
      `${SOFT} .cart-page [class|="vc"]`,
      `${SOFT} .cart-page [class]`,
      `${SOFT} .cart-page [CLASS*="VC-BUTTON" i]`,
    ])("rejects a [class] match it cannot read as classes: %s", (selector) => {
      expect(checkForeignBlocks(selector, "cart-page", blocks)).toContain("matches [class] by presence");
    });

    it.each([
      `${SOFT} .cart-page__x .cart-page--y`,
      `${SOFT} .cart-page:not(.vc-button)`,
      `${SOFT} .cart-page:not([class*="vc-"])`,
      `${SOFT} .cart-page .unknown`,
      `${SOFT}.dark .cart-page .x`,
    ])("allows %s", (selector) => {
      expect(checkForeignBlocks(selector, "cart-page", blocks)).toBeNull();
    });

    it.each(["fade-enter-active", "list-leave-to", "list-move", "is-visible", "has-items"])(
      "allows the transition or state class .%s, even where a source defines it",
      (name) => {
        const withState = new Map([...blocks, [name, "app"]]);

        expect(checkForeignBlocks(`${SOFT} .vc-button.${name}`, "vc-button", withState)).toBeNull();
      },
    );

    it("ignores the soft prefix, so a block named `dark` does not reject it", () => {
      expect(checkForeignBlocks(`${SOFT}.dark .cart-page`, "cart-page", new Map([["dark", "app"]]))).toBeNull();
    });
  });

  describe("checkTokensSelector", () => {
    it("allows the soft prefix alone", () => {
      expect(checkTokensSelector(`${SOFT}.dark`)).toBeNull();
    });

    it("rejects a selector below <html>", () => {
      expect(checkTokensSelector(`${SOFT} .vc-button`)).toContain("only sets tokens");
    });
  });

  describe("definedBlocks", () => {
    it("does not count a Vue transition or state class as a block", () => {
      const css =
        ".fade-enter-active, .list-leave-to, .list-move, .is-visible, .has-items, .v-enter-from { margin: 0; }";

      expect([...definedBlocks([{ file: "a.scss", css }])]).toEqual([]);
    });

    it("counts a block only where a root-level rule starts with it", () => {
      const blocks = definedBlocks([
        { file: "a.scss", css: ".vc-a { &__b { color: red; } } @media print { .vc-c--x { margin: 0; } }" },
        { file: "b.scss", css: ".variations-default .vc-line-item { margin: 0; } .x { .vc-d { margin: 0; } }" },
      ]);

      expect([...blocks].sort((a, b) => a.localeCompare(b))).toEqual(["variations-default", "vc-a", "vc-c", "x"]);
    });
  });

  describe("checkSides", () => {
    let root = "";

    afterEach(() => {
      rmSync(root, { recursive: true, force: true });
    });

    /** An entry that loads every block file and `_tokens.scss` of the folder, as the real ones do. */
    function entry(files: Record<string, string | null>, softDir: string, layer: string): string {
      const loads = (names: string[]) => names.map((name) => `@include meta.load-css("${name}");`).join(" ");
      const names = Object.keys(files)
        .filter((file) => file.startsWith(`${softDir}/`))
        .map((file) => file.slice(softDir.length + 1).replace(/\.scss$/, ""));
      const tokens = names.filter((name) => name === "_tokens");
      const blocks = names.filter((name) => !path.basename(name).startsWith("_") && name !== "index");

      return `@use "sass:meta"; @media screen { @layer theme { ${loads(tokens)} } @layer ${layer} { ${loads(blocks)} } }`;
    }

    /** Writes the files under a temporary root; an `index.scss` left out loads the folder, `null` writes none. */
    function sides(files: Record<string, string | null>): ISideType[] {
      root = mkdtempSync(path.join(tmpdir(), "soft-"));

      const all: Record<string, string | null> = {
        "kit/soft/index.scss": entry(files, "kit/soft", "vc.design.kit"),
        "app/soft/index.scss": entry(files, "app/soft", "vc.design.app"),
        ...files,
      };

      for (const [file, text] of Object.entries(all)) {
        if (text !== null) {
          mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
          writeFileSync(path.join(root, file), text);
        }
      }

      const at = (file: string) => path.join(root, file);

      return [
        {
          name: "ui-kit",
          softDir: at("kit/soft"),
          sources: [at("kit/vc-button.vue"), at("kit/vc-card.vue"), at("kit/vc-link.vue")],
          layer: "vc.design.kit",
        },
        {
          name: "app",
          softDir: at("app/soft"),
          sources: [at("app/cart-page.vue"), at("app/product-card.vue"), at("app/fade.scss")],
          layer: "vc.design.app",
          excludes: "ui-kit",
        },
      ];
    }

    const BASE = {
      "kit/vc-button.vue": "<style>.vc-button { color: red; }</style>",
      "kit/vc-card.vue": "<style>.vc-card { color: red; }</style>",
      "kit/vc-link.vue": '<template><a class="vc-link" /></template>',
      "app/cart-page.vue": "<style>.cart-page { margin: 0; }</style>",
      "app/product-card.vue": "<style>.product-card { margin: 0; }</style>",
      "app/fade.scss": ".fade-enter-active { transition: opacity 0.2s; }",
    };

    it("passes a block file of each side", () => {
      const result = checkSides(
        sides({
          ...BASE,
          "kit/soft/vc-link.scss": `${SOFT} .vc-link { padding: 0; }`,
          "app/soft/cart-page.scss": `${SOFT} .cart-page { padding: 0; }`,
        }),
      );

      expect(result).toEqual({ errors: [], fileCount: 4 });
    });

    it("rejects an app file named after a kit block", () => {
      const { errors } = checkSides(
        sides({ ...BASE, "app/soft/vc-button.scss": `${SOFT} .vc-button { padding: 0; }` }),
      );

      expect(errors).toEqual([expect.stringContaining(".vc-button is a block of the ui-kit side; restyle it there")]);
    });

    it("rejects an app selector that reaches into a kit block, a style-less component included", () => {
      const { errors } = checkSides(
        sides({ ...BASE, "app/soft/cart-page.scss": `${SOFT} .cart-page { &:has(.vc-link) { padding: 0; } }` }),
      );

      expect(errors).toEqual([expect.stringContaining("names .vc-link, a block of the ui-kit side")]);
    });

    it("names the first side that defines a block both sides define", () => {
      const { errors } = checkSides(
        sides({
          ...BASE,
          "app/fade.scss": ".vc-card { margin: 0; }",
          "app/soft/cart-page.scss": `${SOFT} .cart-page:has(.vc-card) { padding: 0; }`,
        }),
      );

      expect(errors).toEqual([expect.stringContaining("names .vc-card, a block of the ui-kit side")]);
    });

    it.each([
      ["kit/soft/vc-card.scss", `${SOFT} .vc-button .vc-card { padding: 0; }`, "vc-button", "ui-kit"],
      ["kit/soft/vc-card.scss", `${SOFT} .vc-card:has(.vc-button) { padding: 0; }`, "vc-button", "ui-kit"],
      ["kit/soft/vc-button.scss", `${SOFT} .cart-page .vc-button { padding: 0; }`, "cart-page", "app"],
      ["app/soft/cart-page.scss", `${SOFT} .product-card .cart-page__x { padding: 0; }`, "product-card", "app"],
    ])("rejects %s naming another block: %s", (file, source, named, side) => {
      const { errors } = checkSides(sides({ ...BASE, [file]: source }));

      expect(errors).toEqual([expect.stringContaining(`names .${named}, a block of the ${side} side`)]);
    });

    it.each([
      ["app/soft/_tokens.scss", `${SOFT} .cart-page { --cart-page-radius: 0; }`, "only sets tokens"],
      ["app/soft/index.scss", `${SOFT} .cart-page { padding: 0; }`, "an entry or partial holds no rules"],
      ["app/soft/_shared.scss", `${SOFT} .cart-page { padding: 0; }`, "an entry or partial holds no rules"],
    ])("rejects a rule in %s", (file, source, message) => {
      const { errors } = checkSides(sides({ ...BASE, [file]: source }));

      expect(errors).toEqual([expect.stringContaining(message)]);
    });

    it("checks a hidden .scss file", () => {
      const { errors } = checkSides(
        sides({ ...BASE, "app/soft/index.scss": "", "app/soft/.cart-page.scss": `${SOFT} .vc-button { padding: 0; }` }),
      );

      expect(errors).toContainEqual(expect.stringContaining("app/soft/.cart-page.scss:1"));
      expect(errors).toContainEqual(expect.stringContaining(".cart-page.scss  ships none of its rules through"));
    });

    it("exempts only the real _layers.scss, not a file of that name elsewhere", () => {
      const { errors } = checkSides(
        sides({
          ...BASE,
          "app/_layers.scss": ".vc-button { opacity: 0; }",
          "app/soft/index.scss": '@use "../layers";',
        }),
      );

      expect(errors).toEqual([expect.stringContaining("app/_layers.scss is not a .scss file in")]);
    });

    it("allows a block file loaded from its side's soft/", () => {
      const { errors } = checkSides(
        sides({
          ...BASE,
          "app/soft/index.scss":
            '@use "sass:meta"; @media screen { @layer vc.design.app { @include meta.load-css("pages/cart-page"); } }',
          "app/soft/pages/cart-page.scss": `${SOFT} .cart-page { padding: 0; }`,
        }),
      );

      expect(errors).toEqual([]);
    });

    it("rejects a block of neither side", () => {
      const { errors } = checkSides(sides({ ...BASE, "kit/soft/vc-panel.scss": `${SOFT} .vc-panel { padding: 0; }` }));

      expect(errors).toEqual([expect.stringContaining(".vc-panel is not a block of the ui-kit side")]);
    });

    const check = (files: Record<string, string>) => checkSides(sides({ ...BASE, ...files })).errors;

    it("passes a captured state compounded on the block, nested properties and a partial's mixin", () => {
      const block = `@use "mixins";
        ${SOFT} .vc-button {
          $loading: "";
          &--loading { $loading: &; }
          &--disabled:not(#{$loading}) { opacity: 1; }
          font: { weight: 700; }
          @include mixins.flat;
          &__icon { opacity: 0.5; }
          @media (width >= 1px) { @supports (display: grid) { @container (width > 1px) { padding: 0; } } }
          @starting-style { opacity: 0; }
        }`;

      expect(
        check({ "kit/soft/_mixins.scss": "@mixin flat { box-shadow: none; }", "kit/soft/vc-button.scss": block }),
      ).toEqual([]);
    });

    it("reports a capture read as an ancestor, which repeats the soft prefix", () => {
      const block = `${SOFT} .vc-button { $disabled: ""; &--disabled { $disabled: &; } &__icon { #{$disabled} & { opacity: 0.5; } } }`;

      expect(check({ "kit/soft/vc-button.scss": block })).toEqual([
        expect.stringContaining("a capture read as an ancestor (#{$x} &) repeats the soft prefix"),
      ]);
    });

    it.each([
      ["a nested-property shorthand with no space", `${SOFT} .vc-button { .vc-card { margin:-1px {} } }`],
      ["a hex nested property", `.vc-button { background:#fff{} }`],
      ["a selector built by interpolation", `${SOFT} .vc-button { &--#{"x .vc-card"} { opacity: 0; } }`],
      ["a capture used outside its block", `${SOFT} .vc-button { $b: &; @at-root .vc-card #{$b} { opacity: 0; } }`],
      ["@at-root", `@at-root .vc-card { opacity: 0; }`],
      ["@extend of another block", `${SOFT} .vc-card { margin: 0; } ${SOFT} .vc-button { @extend .vc-card; }`],
      ["a mixin from a partial", `@use "mixins"; ${SOFT} .vc-button { @include mixins.reach; }`],
    ])("checks the selector Sass emits for %s", (_name, source) => {
      const errors = check({
        "kit/soft/_mixins.scss": "@mixin reach { .vc-card & { opacity: 0; } }",
        "kit/soft/vc-button.scss": source,
      });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.every((error) => /does not style|must start with|names \.vc-card/.test(error))).toBe(true);
    });

    it("reports a colour token (`color`, `bg`, `-text`, `-border`, `-icon`), also through an escaped or interpolated name", () => {
      const errors = check({
        "kit/soft/vc-button.scss": String.raw`${SOFT} .vc-button {
          --vc-button-bg-color: red;
          --vc-button-b\67: red;
          #{"--vc-button-b\\g"}: red;
          -\-vc-button-bg-color: red;
          \2d\2d vc-button-bg-color: red;
          #{"--vc-button-c\\6f lor"}: red;
          --vc-button-solid-primary-text: red;
          --vc-button-solid-primary-border: red;
          --vc-button-solid-primary-icon: red;
          --vc-button-border-width: 0;
          --vc-button-text-transform: none;
          color: red;
          background-color: red;
          #{"\\110000-x"}: 1;
          --vc-button-icon-size: 1rem;
        }`,
      });

      expect(errors).toEqual([
        expect.stringContaining("--vc-button-bg-color: colour tokens belong to presets"),
        expect.stringContaining("--vc-button-bg: colour tokens belong to presets"),
        expect.stringContaining(String.raw`--vc-button-b\g: colour tokens belong to presets`),
        expect.stringContaining(String.raw`-\-vc-button-bg-color: colour tokens belong to presets`),
        expect.stringContaining(String.raw`\--vc-button-bg-color: colour tokens belong to presets`),
        expect.stringContaining(String.raw`--vc-button-c\6f lor: colour tokens belong to presets`),
        expect.stringContaining("--vc-button-solid-primary-text: colour tokens belong to presets"),
        expect.stringContaining("--vc-button-solid-primary-border: colour tokens belong to presets"),
        expect.stringContaining("--vc-button-solid-primary-icon: colour tokens belong to presets"),
      ]);
    });

    it.each([
      ["@apply", `${SOFT} .vc-button { @apply [&_.vc-card]:hidden; }`],
      ["@keyframes", "@keyframes spin { to { opacity: 0; } }"],
      ["@import", "@import url(../x.css);"],
      ["@scope", `@scope (.vc-card) { ${SOFT} .vc-button { opacity: 0; } }`],
      ["@property", "@property --x { syntax: '<length>'; inherits: false; initial-value: 0; }"],
    ])("reports %s, which ships CSS the check does not read", (name, source) => {
      expect(check({ "kit/soft/vc-button.scss": source })).toContainEqual(
        expect.stringContaining(`${name} is not allowed in a soft file`),
      );
    });

    it("reports a problem once, at the line that wrote it, also when an entry loads the file", () => {
      const errors = check({
        "kit/soft/index.scss":
          '@use "sass:meta"; @media screen { @layer vc.design.kit { @include meta.load-css("vc-button"); } }',
        "kit/soft/vc-button.scss": `${SOFT} .vc-button {\n  --vc-button-bg: red;\n}\n${SOFT} .vc-card {\n  margin: 0;\n}`,
      });

      expect(errors).toEqual([
        expect.stringMatching(/kit\/soft\/vc-button\.scss:2 .*colour tokens belong to presets/),
        expect.stringMatching(/kit\/soft\/vc-button\.scss:4 .*does not style \.vc-button/),
      ]);
    });

    it.each([
      ["a rule of its own", `${SOFT} .vc-button { padding: 0; }`],
      ["a block file's mixin", `@use "vc-button"; @include vc-button.reach;`],
      ["a loaded block nested under a selector", `@use "sass:meta"; .vc-card { @include meta.load-css("vc-button"); }`],
      ["a block's selector with declarations of its own", `${SOFT} .vc-button { --vc-button-bg-color: red; }`],
    ])("rejects an entry that emits %s", (_name, source) => {
      const errors = check({
        "kit/soft/index.scss": source,
        "kit/soft/vc-button.scss": `@mixin reach { ${SOFT} .vc-card { opacity: 0; } } ${SOFT} .vc-button { margin: 0; }`,
      });

      expect(errors).toContainEqual(expect.stringContaining("an entry or partial holds no rules of its own"));
    });

    it.each([
      '@use "../x";',
      '@forward "../x";',
      '@import "../x";',
      '@use "sass:meta"; @include meta.load-css("../x");',
      '@use "sass:meta" as *; @include load-css($url: "../" + "x");',
      '@use "@/assets/styles/vendors/builder-io";',
      '@use "sass:meta"; @include meta.load-css("x.css");',
    ])("reports a stylesheet loaded from outside soft/: %s", (source) => {
      const errors = check({
        "app/_x.scss": ".vc-card { margin: 0; }",
        "app/soft/x.css": "",
        "app/soft/index.scss": source,
      });

      expect(errors).toEqual([expect.stringContaining("is not a .scss file in")]);
    });

    it("loads the partial of a target written with its extension, as Sass does", () => {
      const errors = check({
        "kit/soft/_shared.scss": "@mixin flat { box-shadow: none; }",
        "kit/soft/vc-button.scss": `@use "shared.scss"; ${SOFT} .vc-button { @include shared.flat; }`,
      });

      expect(errors).toEqual([]);
    });

    it("reports a load target that matches more than one file", () => {
      const errors = check({ "app/soft/x.scss": "", "app/soft/_x.scss": "", "app/soft/index.scss": '@use "x";' });

      expect(errors).toContainEqual(expect.stringContaining("matches 2 files"));
    });

    it("reports a load target that resolves to no file", () => {
      expect(check({ "app/soft/index.scss": '@use "missing";' })).toEqual([
        expect.stringMatching(/app\/soft\/index\.scss:1 .*Can't find stylesheet to import/),
      ]);
    });

    it("allows the real layer order, Sass modules and the side's own files", () => {
      const errors = check({
        "app/soft/index.scss":
          '@use "@/assets/styles/layers"; @use "sass:meta"; @media screen { @layer theme { @include meta.load-css("tokens"); } }',
        "app/soft/_tokens.scss": `${SOFT} { --cart-page-radius: 0; }`,
      });

      expect(errors).toEqual([]);
    });

    it("allows a transition class that a source of the other side defines, on the block's own element", () => {
      const errors = check({
        "kit/soft/vc-button.scss": `${SOFT} .vc-button.fade-enter-active { border-radius: 0; }`,
      });

      expect(errors).toEqual([]);
    });

    it.each([
      ["a module used, not loaded", '@use "vc-button";', "ships in no at-rule"],
      ["a load with no wrapper", '@use "sass:meta"; @include meta.load-css("vc-button");', "ships in no at-rule"],
      [
        "a block loaded next to the tokens",
        '@use "sass:meta"; @media screen { @layer theme { @include meta.load-css("vc-button"); } }',
        "ships in @media screen > @layer theme",
      ],
      [
        "a block in the other side's layer",
        '@use "sass:meta"; @media screen { @layer vc.design.app { @include meta.load-css("vc-button"); } }',
        "ships in @media screen > @layer vc.design.app",
      ],
      [
        "a block loaded for print",
        '@use "sass:meta"; @media print { @layer vc.design.kit { @include meta.load-css("vc-button"); } }',
        "ships in @media print > @layer vc.design.kit",
      ],
      [
        "a block in a sublayer",
        '@use "sass:meta"; @media screen { @layer vc.design.kit.x { @include meta.load-css("vc-button"); } }',
        "ships in @media screen > @layer vc.design.kit.x",
      ],
      [
        "the tokens in the block layer",
        '@use "sass:meta"; @media screen { @layer vc.design.kit { @include meta.load-css("tokens"); } }',
        "ships in @media screen > @layer vc.design.kit",
      ],
    ])("rejects an entry that ships %s outside its layer", (_name, source, message) => {
      const errors = check({
        "kit/soft/index.scss": source,
        "kit/soft/_tokens.scss": `${SOFT} { --vc-button-radius: 0; }`,
        "kit/soft/vc-button.scss": `${SOFT} .vc-button { margin: 0; @media (width >= 1px) { margin: 1px; } }`,
      });

      expect(errors).toContainEqual(expect.stringContaining(message));
    });

    it("allows a block's own at-rules inside the entry's wrappers", () => {
      const errors = check({
        "kit/soft/vc-button.scss": `${SOFT} .vc-button { margin: 0; @media (width >= 1px) { @supports (display: grid) { margin: 1px; } } }`,
      });

      expect(errors).toEqual([]);
    });

    it("reports a block file's own @layer, which lands below the side's layer", () => {
      const errors = check({
        "kit/soft/vc-button.scss": `@layer x { ${SOFT} .vc-button { margin: 0; } }`,
      });

      expect(errors).toEqual([expect.stringContaining("ships in @media screen > @layer vc.design.kit > @layer x")]);
    });

    it("does not report an unloaded block file that emits no rules", () => {
      const errors = check({
        "kit/soft/index.scss": "",
        "kit/soft/vc-button.scss": "$gap: 1px;",
      });

      expect(errors).toEqual([]);
    });

    it("reports a block file the entry does not load", () => {
      const errors = check({
        "kit/soft/index.scss": "",
        "kit/soft/vc-button.scss": `${SOFT} .vc-button { margin: 0; }`,
      });

      expect(errors).toEqual([expect.stringContaining("vc-button.scss  ships none of its rules through")]);
    });

    it("fails when a side's soft entry is missing", () => {
      const { errors } = checkSides(sides({ ...BASE, "app/soft/index.scss": null }));

      expect(errors).toEqual([expect.stringContaining("soft/index.scss is missing; the app soft styles")]);
    });
  });
});
