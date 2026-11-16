// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  checkBlockSelector,
  checkColorValue,
  checkDesigns,
  checkForeignBlocks,
  checkPresets,
  checkPresetSelector,
  checkTokensSelector,
  colorSemantics,
  definedBlocks,
  sourceBlocks,
} from "./check-designs.js";
import type { IDesignCheckOptions } from "./check-designs.js";

const SOFT = 'html[data-design="soft"]';
const TOKENS_ONLY = `_tokens.scss sets tokens only on ${SOFT} or html.dark[data-design="soft"]`;
const DARK_MEDIA =
  "@media (prefers-color-scheme: dark) follows the OS theme, not the storefront's dark mode (`dark:` writes it)";
const LIGHT_MEDIA = "@media (prefers-color-scheme: light) follows the OS theme, not the storefront's dark mode";
const osTheme = (media: string, places: string) => `${media}; drop it: ${places}`;
const printOnly = (params: string, owner: string) =>
  `@media ${params}: ${owner} holds no print rules (\`print:\` writes them); they go in vc.print, client-app/assets/styles/print/`;

describe("check-designs", () => {
  describe("checkBlockSelector", () => {
    it.each([
      ".vc-button",
      ".vc-button__icon",
      ".vc-button--primary:hover",
      ".vc-button .vc-button__icon::before",
      ".vc-button:has(.x)",
      ".vc-button--a .vc-button__icon",
    ])("allows %s", (selector) => {
      expect(checkBlockSelector(selector, "vc-button")).toBeNull();
    });

    it.each([
      "html .vc-button",
      '[data-design="soft"] .vc-button',
      `${SOFT} .vc-button`,
      "HTML .vc-button",
      ".vc-button:not([DATA-DESIGN])",
    ])("rejects %s, which names what index.scss adds", (selector) => {
      expect(checkBlockSelector(selector, "vc-button")).toContain(
        "a block file names no html and no [data-design]; index.scss adds them",
      );
    });

    it.each([".dark .vc-button", ".vc-button.dark", ".dark .x .vc-button__icon"])(
      "rejects %s, which never matches below html",
      (selector) => {
        expect(checkBlockSelector(selector, "vc-button")).toContain(
          "a block file names no .dark; put dark rules in dark/vc-button.scss",
        );
      },
    );

    it.each([".dark .vc-button", ".vc-button.dark"])(
      "rejects %s in a dark file, where index.scss adds .dark",
      (selector) => {
        expect(checkBlockSelector(selector, "vc-button", "dark")).toBe(
          `"${selector}": a dark file names no .dark; index.scss adds it`,
        );
      },
    );

    it.each([
      ".vc-button > .x",
      ".vc-button button",
      ".vc-button *",
      ".vc-button > :first-child",
      ".vc-button ~ .other",
      ".vc-button + .other",
      ".x:has(.vc-button)",
      ".x:has(.foo, .vc-button)",
      ".x:is(.vc-button)",
      ".vc-buttons",
      ":root",
    ])("rejects %s, which does not style the block", (selector) => {
      expect(checkBlockSelector(selector, "vc-button")).toContain("does not style .vc-button");
    });
  });

  describe("checkForeignBlocks", () => {
    const blocks = new Set(["vc-button", "vc-card", "cart-page", "product-card"]);

    it.each([
      [".vc-card .vc-button", "vc-card", "vc-button"],
      [".vc-button .vc-card__body", "vc-button", "vc-card__body"],
      [".cart-page .vc-button", "cart-page", "vc-button"],
      [".cart-page .product-card", "cart-page", "product-card"],
      [".cart-page:has(.vc-button)", "cart-page", "vc-button"],
      [".cart-page:is(.x, .vc-card)", "cart-page", "vc-card"],
      [".cart-page:not(:not(.vc-button))", "cart-page", "vc-button"],
      ['.cart-page [class~="vc-button"]', "cart-page", "vc-button"],
      ['.cart-page [class="x vc-button--primary"]', "cart-page", "vc-button--primary"],
      ['.cart-page [CLASS~="VC-BUTTON" i]', "cart-page", "vc-button"],
    ])("rejects %s in the file of .%s", (selector, own, named) => {
      expect(checkForeignBlocks(selector, own, blocks)).toContain(
        `names .${named}, another block; a block file restyles only its own block`,
      );
    });

    it.each([
      '.cart-page [class*="vc-button"]',
      '.cart-page [class^="vc-"]',
      '.cart-page [class$="button"]',
      '.cart-page [class|="vc"]',
      ".cart-page [class]",
      '.cart-page [CLASS*="VC-BUTTON" i]',
    ])("rejects a [class] match it cannot read as classes: %s", (selector) => {
      expect(checkForeignBlocks(selector, "cart-page", blocks)).toContain("matches [class] by presence");
    });

    it.each([
      ".cart-page__x .cart-page--y",
      ".cart-page:not(.vc-button)",
      '.cart-page:not([class*="vc-"])',
      ".cart-page .unknown",
    ])("allows %s", (selector) => {
      expect(checkForeignBlocks(selector, "cart-page", blocks)).toBeNull();
    });

    it.each(["fade-enter-active", "list-leave-to", "list-move", "is-visible", "has-items"])(
      "allows the transition or state class .%s, even where a source defines it",
      (name) => {
        expect(checkForeignBlocks(`.vc-button.${name}`, "vc-button", new Set([...blocks, name]))).toBeNull();
      },
    );
  });

  describe("checkTokensSelector", () => {
    it.each([SOFT, 'html.dark[data-design="soft"]', "html[data-design=soft].dark"])("allows %s", (selector) => {
      expect(checkTokensSelector(selector, "soft")).toBeNull();
    });

    it.each([
      'html[data-design="classic"]',
      'body[data-design="soft"]',
      `${SOFT}:hover`,
      `${SOFT} .x`,
      ":root",
      'html[data-design*="soft"]',
    ])("rejects %s", (selector) => {
      expect(checkTokensSelector(selector, "soft")).toContain(TOKENS_ONLY);
    });
  });

  describe("checkPresetSelector", () => {
    const blocks = new Set(["vc-button", "footer-links"]);
    const MERCURY = 'html[data-preset="mercury"]';

    it.each([
      `${MERCURY} .vc-button`,
      `html.dark[data-preset="mercury"] .vc-button__icon`,
      `${MERCURY} .vc-button--primary:hover`,
      `${MERCURY} .footer-links .vc-button`,
    ])("allows %s", (selector) => {
      expect(checkPresetSelector(selector, "mercury", blocks)).toBeNull();
    });

    it.each([MERCURY, 'html.dark[data-preset="mercury"]', "html[data-preset=mercury].dark"])(
      "allows the preset's html alone, %s, which takes tokens",
      (selector) => {
        expect(checkPresetSelector(selector, "mercury", blocks)).toBeNull();
      },
    );

    it.each([
      ".vc-button",
      'html[data-preset="red"] .vc-button',
      'html[data-preset="red"]',
      `${MERCURY}:hover`,
      `${MERCURY}:hover .vc-button`,
    ])("rejects %s, which is neither the preset's html nor below it", (selector) => {
      expect(checkPresetSelector(selector, "mercury", blocks)).toContain(
        `a preset stylesheet sets tokens on ${MERCURY} or html.dark[data-preset="mercury"], or styles blocks below them`,
      );
    });

    it.each([`${MERCURY} .dark .vc-button`, `${MERCURY} [data-design="soft"] .vc-button`])(
      "rejects %s, which names the prefix again",
      (selector) => {
        expect(checkPresetSelector(selector, "mercury", blocks)).toContain("belong to the prefix only");
      },
    );

    it.each([`${MERCURY} .vc-button svg`, `${MERCURY} .vc-button > *`, `${MERCURY} .unknown`])(
      "rejects %s, which styles no block",
      (selector) => {
        expect(checkPresetSelector(selector, "mercury", blocks)).toContain("styles no block");
      },
    );
  });

  describe("checkColorValue", () => {
    const semantics = new Set(["--link-color"]);

    it.each([
      "var(--color-primary-500)",
      "var(--link-color)",
      "var(--vc-button-solid-primary-bg-color)",
      "color-mix(in srgb, var(--color-primary-500) 40%, transparent)",
      "rgb(from var(--color-additional-950) r g b / 0.05)",
      "0 1px 2px var(--color-neutral-950)",
      "transparent",
      "currentColor",
      "inherit",
      "1rem",
      "rgb(0 0 0 / 0) var(--tw-gradient-to-position)",
      "rgb(255 255 255 / 0)",
      "rgba(0, 0, 0, 0)",
      "hsl(0 0% 0% / 0%)",
      "#fff0",
      "#ffffff00",
      "0 0 #0000",
    ])("allows %s", (value) => {
      expect(checkColorValue(value, semantics)).toBeNull();
    });

    it.each([
      ["var(--x)", "var(--x) is no preset variable"],
      ["var(--bg-color)", "var(--bg-color) is no preset variable"],
      ["#fff", "#fff is a literal colour"],
      ["var(--color-primary-500, #fff)", "#fff is a literal colour"],
      ["rgb(0 0 0 / 0.1)", 'rgb() without "from" is a literal colour'],
      ["rgb(255 0 0 / 0.5)", 'rgb() without "from" is a literal colour'],
      ["rgb(0, 0, 0)", 'rgb() without "from" is a literal colour'],
      ["rgba(0, 0, 0, 0.5)", 'rgba() without "from" is a literal colour'],
      ["hsl(0 0% 0%)", 'hsl() without "from" is a literal colour'],
      ["color-mix(in srgb, var(--color-primary-500), white)", "white is a named colour"],
      ["red", "red is a named colour"],
      ["#ffffff01", "#ffffff01 is a literal colour"],
      ["rgb(from rgb(227 6 19 / 0) r g b / 1)", 'rgb() without "from" is a literal colour'],
      ["rgb(from #fff0 r g b / 1)", "#fff0 is a literal colour"],
      ["rgb(from #0000 r g b / 1)", "#0000 is a literal colour"],
      ["rgb(from var(--vc-x, #fff0) r g b / 1)", "#fff0 is a literal colour"],
      ["rgb(from var(--vc-x, rgb(227 6 19 / 0)) r g b / 1)", 'rgb() without "from" is a literal colour'],
      ["rgb(from transparent r g b / 1)", "transparent is a named colour"],
      ["hsl(from transparent h s l / 1)", "transparent is a named colour"],
      ["rgb(from var(--vc-x, transparent) r g b / 1)", "transparent is a named colour"],
      ["rgb(from var(--vc-x, var(--vc-y, #fff0)) r g b / 1)", "#fff0 is a literal colour"],
      ["rgb(from var(--vc-x, var(--vc-y, transparent)) r g b / 1)", "transparent is a named colour"],
    ])("rejects %s", (value, reason) => {
      expect(checkColorValue(value, semantics)).toBe(reason);
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
        { file: "a.scss", css: ".vc-a { &__b { margin: 0; } } @media print { .vc-c--x { margin: 0; } }" },
        { file: "b.scss", css: ".variations-default .vc-line-item { margin: 0; } .x { .vc-d { margin: 0; } }" },
      ]);

      expect([...blocks].sort((a, b) => a.localeCompare(b))).toEqual(["variations-default", "vc-a", "vc-c", "x"]);
    });
  });

  describe("checkDesigns", () => {
    let root = "";

    afterEach(() => {
      rmSync(root, { recursive: true, force: true });
    });

    const SOURCES: Record<string, string> = {
      "src/vc-button.vue": "<style>.vc-button { margin: 0; }</style>",
      "src/vc-card.vue": "<style>.vc-card { margin: 0; }</style>",
      "src/vc-link.vue": '<template><a class="vc-link" /></template>',
      "src/footer-links.vue": "<style>.footer-links { margin: 0; }</style>",
      "src/cart-page.vue": "<style>.cart-page { margin: 0; }</style>",
      "src/fade.scss": ".fade-enter-active { transition: opacity 0.2s; }",
    };

    function write(file: string, text: string): void {
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, text);
    }

    function wiring(design: string, files: string[]): string {
      const loads = (dir: string) =>
        files
          .filter((file) => path.dirname(file) === dir)
          .map((file) => `    @include meta.load-css("${dir}/${path.basename(file, ".scss")}");\n`)
          .join("");
      const tokens = files.includes("_tokens.scss") ? '  @include meta.load-css("tokens");\n' : "";

      return `@use "sass:meta";

@layer theme {
${tokens}}

@layer vc.design {
  html[data-design="${design}"] {
${loads("blocks")}  }

  html.dark[data-design="${design}"] {
${loads("dark")}  }
}
`;
    }

    /**
     * Writes the sources and the design folders (keys relative to the designs folder) under a temporary
     * root. A folder's `index.scss` left out is generated by `wiring`; `null` writes none.
     */
    function designs(files: Record<string, string | null>): IDesignCheckOptions {
      root = mkdtempSync(path.join(tmpdir(), "designs-"));

      const designsDir = path.join(root, "designs");
      const folders = new Set(
        Object.keys(files)
          .filter((file) => file.includes("/"))
          .map((file) => file.split("/")[0]),
      );
      const all: Record<string, string | null> = {};

      for (const folder of folders) {
        const own = Object.keys(files)
          .filter((file) => file.startsWith(`${folder}/`))
          .map((file) => file.slice(folder.length + 1));

        all[`${folder}/index.scss`] = wiring(folder, own);
      }

      for (const [file, text] of Object.entries({ ...all, ...files })) {
        if (text !== null) {
          write(path.join(designsDir, file), text);
        }
      }

      for (const [file, text] of Object.entries(SOURCES)) {
        write(path.join(root, file), text);
      }

      return {
        designsDir,
        blocks: sourceBlocks(Object.keys(SOURCES).map((file) => path.join(root, file))),
        semantics: colorSemantics(),
      };
    }

    const check = async (files: Record<string, string | null>) => (await checkDesigns(designs(files))).errors;

    it("passes a design with tokens, a block and its dark file", async () => {
      const result = await checkDesigns(
        designs({
          "soft/_tokens.scss": `${SOFT} { --vc-radius: 1rem; }`,
          "soft/blocks/footer-links.scss": ".footer-links { &__title { text-transform: none; } }",
          "soft/dark/footer-links.scss": ".footer-links { &__title { text-transform: none; } }",
        }),
      );

      expect(result).toEqual({ errors: [], designCount: 1, fileCount: 4 });
    });

    it("passes $x: & captures, @apply, a variant and a nested @media", async () => {
      const block = `.footer-links {
        $c: &;
        &--compact { #{$c}__title { @apply uppercase hover:underline; } }
        @media (min-width: 1px) { &__title { margin: 0; } }
      }`;

      expect(await check({ "soft/blocks/footer-links.scss": block })).toEqual([]);
    });

    it("passes a nested @supports and @container", async () => {
      const block = `.footer-links {
        @supports (display: grid) { &__title { margin: 0; } }
        @container (min-width: 1px) { &__title { padding: 0; } }
      }`;

      expect(await check({ "soft/blocks/footer-links.scss": block })).toEqual([]);
    });

    it("counts each design folder once", async () => {
      const result = await checkDesigns(
        designs({
          "soft/_tokens.scss": `${SOFT} { --vc-radius: 1rem; }`,
          "mybrand/_tokens.scss": 'html[data-design="mybrand"] { --vc-radius: 0; }',
        }),
      );

      expect(result).toEqual({ errors: [], designCount: 2, fileCount: 4 });
    });

    it("allows files next to the folders", async () => {
      const result = await checkDesigns(
        designs({ "custom-fonts.ts": "export {};", "soft/_tokens.scss": `${SOFT} { --vc-radius: 1rem; }` }),
      );

      expect(result).toEqual({ errors: [], designCount: 1, fileCount: 2 });
    });

    it("allows a design.ts in a design folder, which is not a checked file", async () => {
      const result = await checkDesigns(
        designs({
          "soft/design.ts": "export const design = { fonts: [] };",
          "soft/_tokens.scss": `${SOFT} { --vc-radius: 1rem; }`,
        }),
      );

      expect(result).toEqual({ errors: [], designCount: 1, fileCount: 2 });
    });

    it("ignores hidden files in a design folder, its blocks/ and its dark/", async () => {
      const result = await checkDesigns(
        designs({
          "soft/index.scss": wiring("soft", ["_tokens.scss"]),
          "soft/_tokens.scss": `${SOFT} { --vc-radius: 1rem; }`,
          "soft/.DS_Store": "",
          "soft/blocks/.gitkeep": "",
          "soft/dark/.DS_Store": "",
        }),
      );

      expect(result).toEqual({ errors: [], designCount: 1, fileCount: 2 });
    });

    it.each(["classic", "My-Brand", "2brand"])("rejects the folder name %s", async (name) => {
      const errors = await check({ [`${name}/_tokens.scss`]: `html[data-design="${name}"] { --vc-radius: 1rem; }` });

      expect(errors).toContainEqual(
        expect.stringContaining(
          'a design folder is named in lower case (a-z, 0-9, -), starts with a letter and is not "classic"',
        ),
      );
    });

    it("reports a folder without index.scss", async () => {
      const errors = await check({ "soft/_tokens.scss": `${SOFT} { --vc-radius: 1rem; }`, "soft/index.scss": null });

      expect(errors).toEqual([expect.stringContaining("soft/index.scss is missing")]);
    });

    it("reports a missing designs folder", async () => {
      expect(await checkDesigns(designs({}))).toEqual({
        errors: [expect.stringContaining("designs is missing")],
        designCount: 0,
        fileCount: 0,
      });
    });

    it.each([
      ["soft/extra.scss", "soft/extra.scss"],
      ["soft/design.js", "soft/design.js"],
      ["soft/custom-fonts.ts", "soft/custom-fonts.ts"],
      ["soft/design.ts/x.scss", "soft/design.ts"],
      ["soft/notes/x.scss", "soft/notes"],
    ])("reports %s, which is outside the layout", async (file, reported) => {
      const errors = await check({ [file]: ".footer-links { margin: 0; }" });

      expect(errors).toEqual([
        expect.stringContaining(
          `${reported}  is not part of a design folder (design.ts, _tokens.scss, index.scss, blocks/, dark/)`,
        ),
      ]);
    });

    it.each(["blocks", "dark"])("reports a subfolder in %s/", async (dir) => {
      const errors = await check({ [`soft/${dir}/layout/footer-links.scss`]: ".footer-links { margin: 0; }" });

      expect(errors).toEqual([
        expect.stringContaining(`soft/${dir}/layout  blocks/ and dark/ hold files directly, named after their block`),
      ]);
    });

    it.each(["blocks", "dark"])("reports a file in %s/ that is not .scss", async (dir) => {
      const errors = await check({
        "soft/index.scss": wiring("soft", []),
        [`soft/${dir}/footer-links.css`]: ".footer-links { margin: 0; }",
      });

      expect(errors).toEqual([
        expect.stringContaining(
          `soft/${dir}/footer-links.css  blocks/ and dark/ hold only .scss files, named after their block`,
        ),
      ]);
    });

    it("reports a file named after no block", async () => {
      expect(await check({ "soft/blocks/nothing.scss": ".nothing { margin: 0; }" })).toEqual([
        expect.stringContaining(".nothing is not a block of any component"),
      ]);
    });

    it.each([
      [":root { --x: 1; }", TOKENS_ONLY],
      [`${SOFT} .x { --x: 1; }`, TOKENS_ONLY],
      [`${SOFT} { margin: 0; }`, "margin: _tokens.scss sets custom properties only"],
    ])("rejects %s in _tokens.scss", async (tokens, message) => {
      expect(await check({ "soft/_tokens.scss": tokens })).toEqual([expect.stringContaining(message)]);
    });

    const COLOR = "colours come only from preset variables";

    it("checks the values of colour tokens in _tokens.scss and in block files, also through an escaped or interpolated name", async () => {
      const errors = await check({
        "soft/_tokens.scss": String.raw`${SOFT} { --vc-x-bg: red; #{"--vc-x-c\\6f lor"}: red; --vc-radius: 1rem; }`,
        "soft/blocks/vc-button.scss": String.raw`.vc-button {
          --vc-button-bg-color: red;
          --vc-button-b\67: red;
          #{"--vc-button-b\\g"}: red;
          -\-vc-button-bg-color: red;
          \2d\2d vc-button-bg-color: red;
          --vc-button-solid-primary-text: red;
          --vc-button-solid-primary-border: red;
          --vc-button-solid-primary-icon: red;
          --vc-button-border-width: 0;
          --vc-button-text-transform: none;
          #{"\\110000-x"}: 1;
          --vc-button-icon-size: 1rem;
        }`,
      });

      expect(errors).toEqual([
        expect.stringContaining(String.raw`--vc-x-bg, --vc-x-c\6f lor: red is a named colour; ${COLOR}`),
        expect.stringContaining(`--vc-button-bg-color: red is a named colour; ${COLOR}`),
        expect.stringContaining(String.raw`--vc-button-b\67: red is a named colour; ${COLOR}`),
        expect.stringContaining(String.raw`--vc-button-b\g: red is a named colour; ${COLOR}`),
        expect.stringContaining(String.raw`-\-vc-button-bg-color: red is a named colour; ${COLOR}`),
        expect.stringContaining(String.raw`\2d\2d vc-button-bg-color: red is a named colour; ${COLOR}`),
        expect.stringContaining(`--vc-button-solid-primary-text: red is a named colour; ${COLOR}`),
        expect.stringContaining(`--vc-button-solid-primary-border: red is a named colour; ${COLOR}`),
        expect.stringContaining(`--vc-button-solid-primary-icon: red is a named colour; ${COLOR}`),
      ]);
    });

    it("passes colour tokens set from preset variables, and a private size variable named like one", async () => {
      expect(
        await check({
          "soft/_tokens.scss": `${SOFT} { --vc-x-bg: var(--color-primary-500); --vc-x-color: var(--link-color); --vc-brand: var(--color-primary-500); }`,
          "soft/blocks/vc-button.scss": `.vc-button {
            --vc-button-bg-color: color-mix(in srgb, var(--color-primary-500) 40%, transparent);
            --title-text: 1rem;
          }`,
        }),
      ).toEqual([]);
    });

    it.each([
      ["--text-color: var(--color-primary-500)", "--text-color"],
      ["--shadow: 0 0 4px #f00", "--shadow"],
      ["--x: var(--color-primary-500)", "--x"],
    ])("reports a private variable that carries a colour, whatever its name: %s", async (declaration, prop) => {
      expect(await check({ "soft/blocks/vc-button.scss": `.vc-button { ${declaration}; }` })).toEqual([
        expect.stringContaining(`${prop}: a private variable; set the component's public --vc-* token`),
      ]);
    });

    it("reports a literal colour in a shadow token", async () => {
      const errors = await check({
        "soft/_tokens.scss": `${SOFT} { --vc-widget-shadow: 0 6px 20px 0 red; }`,
        "soft/blocks/vc-card.scss": ".vc-card { --vc-shadow-md-1: 0 4px 6px 0 rgb(0 0 0 / 0.1); }",
        "soft/blocks/footer-links.scss": ".footer-links { --vc-widget-shadow: 0 6px 20px 0 var(--my-shadow); }",
      });

      expect(errors).toEqual([
        expect.stringContaining(`--vc-widget-shadow: red is a named colour; ${COLOR}`),
        expect.stringContaining(`--vc-widget-shadow: var(--my-shadow) is no preset variable; ${COLOR}`),
        expect.stringContaining(`--vc-shadow-md-1: rgb() without "from" is a literal colour; ${COLOR}`),
      ]);
    });

    it.each([
      ["0 2px 4px 0 red", "red is a named colour"],
      ["0 2px 4px 0 rgb(255 0 0 / 0.1)", 'rgb() without "from" is a literal colour'],
    ])("reports a colour other than black in a default-step shadow token: %s", async (shadow, message) => {
      expect(await check({ "soft/_tokens.scss": `${SOFT} { --vc-shadow-default-1: ${shadow}; }` })).toEqual([
        expect.stringContaining(`--vc-shadow-default-1: ${message}; ${COLOR}`),
      ]);
    });

    it("passes the default step's black in its token's fallback, as theme() writes it, and no other colour there", async () => {
      const errors = await check({
        "soft/_tokens.scss": `${SOFT} {
          --vc-widget-shadow: theme("boxShadow.DEFAULT");
          --vc-card-shadow: var(--vc-shadow-default-1, 0 1px 3px 0 rgb(255 0 0 / 0.1));
        }`,
      });

      expect(errors).toEqual([
        expect.stringContaining(`_tokens.scss:3  --vc-card-shadow: rgb() without "from" is a literal colour; ${COLOR}`),
      ]);
    });

    it("reports a design's own token that holds a literal colour where it is set, not where it is read", async () => {
      const errors = await check({
        "soft/_tokens.scss": `${SOFT} { --vc-brand: #e30613; }`,
        "soft/blocks/footer-links.scss": ".footer-links { &__title { color: var(--vc-brand); } }",
      });

      expect(errors).toEqual([
        expect.stringContaining(`_tokens.scss:1  --vc-brand: #e30613 is a literal colour; ${COLOR}`),
      ]);
    });

    it("passes shadow tokens from preset variables, and the default step's black", async () => {
      expect(
        await check({
          "soft/_tokens.scss": `${SOFT} {
            --vc-widget-shadow: 0 6px 20px 0 rgb(from var(--color-additional-950) r g b / 0.06), 0 0 #0000;
            --vc-shadow-default-1: 0 2px 4px 0 rgb(0 0 0 / 0.1);
            --vc-shadow-md-2: var(--vc-shadow-md-1);
          }`,
        }),
      ).toEqual([]);
    });

    it.each([
      ["a colour property", "blocks", "color: red", ["color"]],
      ["a border colour in a dark file", "dark", "border-top-color: red", ["border-top-color"]],
      [
        "any …-color property",
        "blocks",
        "scrollbar-color: red blue; -webkit-text-fill-color: red",
        ["scrollbar-color", "-webkit-text-fill-color"],
      ],
      ["a colour property set from a private variable", "blocks", "fill: var(--x)", ["fill"]],
      ["a background shorthand", "blocks", "background: red", ["background"]],
      ["a border shorthand", "dark", "border: 1px solid red", ["border"]],
      ["a border side shorthand", "blocks", "border-inline-start: 1px solid #f00", ["border-inline-start"]],
      ["an outline shorthand", "blocks", "outline: 2px solid #f00", ["outline"]],
      ["a box shadow", "blocks", "box-shadow: 0 0 1px red", ["box-shadow"]],
      ["a text shadow", "blocks", "text-shadow: 0 0 2px rgb(0 0 0)", ["text-shadow"]],
      [
        "a colour function in a shorthand",
        "blocks",
        "text-decoration: underline oklch(50% 0.1 30)",
        ["text-decoration"],
      ],
      ["a gradient", "blocks", "mask-image: linear-gradient(black, transparent)", ["mask-image"]],
      ["a gradient of colours", "blocks", "background-image: linear-gradient(red, blue)", ["background-image"]],
      ["a numeric rgb()", "blocks", "border-color: rgb(0 0 0 / 0.1)", ["border-color"]],
      [
        "a colour mixed with a literal",
        "blocks",
        "color: color-mix(in srgb, var(--color-primary-500), white)",
        ["color"],
      ],
      ["a shadow written with @apply", "blocks", "@apply shadow-[0_2px_10px_rgba(0,0,0,0.1)]", ["--tw-shadow"]],
      ["a drop shadow in a filter", "blocks", "filter: drop-shadow(0 0 4px red)", ["filter"]],
      ["a drop shadow written with @apply", "blocks", "@apply drop-shadow-[0_0_4px_red]", ["--tw-drop-shadow"]],
      [
        "Tailwind's black in a drop shadow that is no theme step",
        "blocks",
        "@apply drop-shadow-[0_0_40px_rgb(0_0_0/1)]",
        ["--tw-drop-shadow"],
      ],
      [
        "a drop shadow in a backdrop filter",
        "blocks",
        "backdrop-filter: drop-shadow(0 0 4px #e30613)",
        ["backdrop-filter"],
      ],
      ["a public token that holds a colour, whatever its name", "blocks", "--vc-brand: #e30613", ["--vc-brand"]],
      ["a prefixed filter", "blocks", "-webkit-filter: drop-shadow(0 0 4px red)", ["-webkit-filter"]],
      [
        "a prefixed backdrop filter",
        "blocks",
        "-webkit-backdrop-filter: drop-shadow(0 0 4px red)",
        ["-webkit-backdrop-filter"],
      ],
      ["a prefixed box shadow", "blocks", "-webkit-box-shadow: 0 0 4px red", ["-webkit-box-shadow"]],
      ["a prefixed text emphasis", "blocks", "-webkit-text-emphasis: 'x' red", ["-webkit-text-emphasis"]],
      ["a prefixed column rule", "blocks", "-webkit-column-rule: 1px solid red", ["-webkit-column-rule"]],
      [
        "-moz- shorthands",
        "blocks",
        "-moz-column-rule: 1px solid red; -moz-border-start: 1px solid red",
        ["-moz-column-rule", "-moz-border-start"],
      ],
      ["a prefixed text stroke", "blocks", "-webkit-text-stroke: 1px red", ["-webkit-text-stroke"]],
      [
        "prefixed border sides",
        "blocks",
        "-webkit-border-before: 1px solid red; -webkit-border-after: 1px solid red; -webkit-border-start: 1px solid red; -webkit-border-end: 1px solid red",
        ["-webkit-border-before", "-webkit-border-after", "-webkit-border-start", "-webkit-border-end"],
      ],
      [
        "a foreign variable in a kit shadow token",
        "blocks",
        "--vc-shadow-md-1: 0 4px 6px 0 var(--my-shadow)",
        ["--vc-shadow-md-1"],
      ],
      [
        "a transparent colour as a relative colour's origin",
        "blocks",
        "color: rgb(from rgb(227 6 19 / 0) r g b / 1)",
        ["color"],
      ],
      ["a transparent hex as a relative colour's origin", "blocks", "--vc-x: rgb(from #fff0 r g b / 1)", ["--vc-x"]],
    ])("reports %s once, naming the properties its line sets", async (_name, dir, declarations, props) => {
      const errors = await check({ [`soft/${dir}/footer-links.scss`]: `.footer-links { ${declarations}; }` });

      expect(errors).toEqual([expect.stringMatching(new RegExp(`:1 {2}${props.join(", ")}: .*; ${COLOR}$`))]);
    });

    it.each([
      "@apply text-primary-500",
      "@apply bg-primary-500",
      "@apply text-opacity-50",
      "@apply bg-opacity-50",
      "@apply ring-primary-500",
      "@apply from-primary-500",
      "@apply bg-gradient-to-r from-primary-500",
      "background: var(--color-primary-500)",
      "color: var(--link-color)",
      "border-color: var(--vc-widget-border-color)",
      "box-shadow: 0 0 0 1px rgb(from var(--color-neutral-950) r g b / 0.1)",
    ])("passes %s, a colour from preset variables", async (declarations) => {
      expect(await check({ "soft/blocks/footer-links.scss": `.footer-links { ${declarations}; }` })).toEqual([]);
    });

    it("reports colours on different lines of one rule apart", async () => {
      const errors = await check({
        "soft/blocks/footer-links.scss": ".footer-links {\n  color: red;\n  background: #fff;\n}",
      });

      expect(errors).toEqual([
        expect.stringMatching(new RegExp(`:2 {2}color: red is a named colour; ${COLOR}$`)),
        expect.stringMatching(new RegExp(`:3 {2}background: #fff is a literal colour; ${COLOR}$`)),
      ]);
    });

    it.each([
      "@apply shadow",
      "@apply shadow-md",
      "@apply ring-2",
      "@apply drop-shadow-md",
      "@apply bg-gradient-to-t from-transparent to-additional-50",
      "@apply bg-gradient-to-t from-additional-50 via-transparent to-additional-50",
      "@apply bg-gradient-to-t from-current to-additional-50",
      "@apply bg-gradient-to-t from-additional-50/0 to-additional-50",
    ])("passes %s: Tailwind's own colours, from the preset, its default black or transparent", async (declarations) => {
      expect(await check({ "soft/blocks/footer-links.scss": `.footer-links { ${declarations}; }` })).toEqual([]);
    });

    it.each([
      "@apply shadow-none",
      "border: 1px solid",
      "border-width: 2px",
      "background: url(x.png) no-repeat",
      'background: url("red.png") center / cover',
      "background-image: none",
      "border-color: transparent",
      "color: currentColor",
      "background: inherit",
      "outline: 1px solid currentcolor",
      "text-decoration: underline wavy",
      "font-family: Tan, Red Hat Display",
      "box-shadow: var(--vc-shadow-md)",
      "@apply bg-gradient-to-r",
      "background-image: linear-gradient(to right, var(--tw-gradient-stops))",
      "--vc-x-skew: calc(tan(10deg) * 100%)",
      "--vc-x: #fff0",
      "--vc-x: #ffffff00",
      "--x: #fff0",
      "background-color: rgb(from currentColor r g b / 0.5)",
    ])("does not read %s as a colour", async (declarations) => {
      expect(await check({ "soft/blocks/footer-links.scss": `.footer-links { ${declarations}; }` })).toEqual([]);
    });

    const BLOCK = ".footer-links { margin: 0; }";
    const DARK = ".footer-links { opacity: 0.8; }";
    const TOKENS = `${SOFT} { --vc-radius: 1rem; }`;
    const load = (file: string) => `@include meta.load-css("${file}");`;
    const index = (theme: string, light: string, dark: string, after = "") =>
      `@use "sass:meta"; @layer theme { ${theme} } @layer vc.design { ${SOFT} { ${light} } html.dark[data-design="soft"] { ${dark} } } ${after}`;
    const LIGHT_PLACE = `ships outside @layer vc.design > ${SOFT}, where index.scss loads blocks/footer-links`;

    it.each([
      [
        "a block file it does not load",
        index(load("tokens"), "", load("dark/footer-links")),
        [`blocks/footer-links.scss  index.scss does not load it: add ${load("blocks/footer-links")} inside`],
      ],
      [
        "a dark file it does not load",
        index(load("tokens"), load("blocks/footer-links"), ""),
        ["dark/footer-links.scss  index.scss does not load it"],
      ],
      [
        "_tokens.scss it does not load",
        index("", load("blocks/footer-links"), load("dark/footer-links")),
        ["_tokens.scss  index.scss does not load it"],
      ],
      [
        "a block file under the dark prefix",
        index(load("tokens"), "", `${load("dark/footer-links")} ${load("blocks/footer-links")}`),
        [LIGHT_PLACE],
      ],
      [
        "a block file outside @layer vc.design",
        index(load("tokens"), "", load("dark/footer-links"), `${SOFT} { ${load("blocks/footer-links")} }`),
        [LIGHT_PLACE],
      ],
      [
        "a block file in a sublayer",
        index(
          load("tokens"),
          "",
          load("dark/footer-links"),
          `@layer vc.design.x { ${SOFT} { ${load("blocks/footer-links")} } }`,
        ),
        [LIGHT_PLACE],
      ],
      [
        "a dark file under the light prefix",
        index(load("tokens"), `${load("blocks/footer-links")} ${load("dark/footer-links")}`, ""),
        ['ships outside @layer vc.design > html.dark[data-design="soft"], where index.scss loads dark/footer-links'],
      ],
      [
        "tokens outside @layer theme",
        index("", load("blocks/footer-links"), load("dark/footer-links"), `@layer vc.design { ${load("tokens")} }`),
        ["ships outside @layer theme, where index.scss loads tokens"],
      ],
      [
        "a rule index.scss writes itself, also where Tailwind merges it into a block file's rule",
        index(
          load("tokens"),
          `${load("blocks/footer-links")} .footer-links { padding: 0; }`,
          load("dark/footer-links"),
        ),
        [
          'index.scss:1  "html[data-design=soft] .footer-links": index.scss holds no rules of its own; put them in a block file',
        ],
      ],
    ])("reports %s", async (_name, entry, messages) => {
      const errors = await check({
        "soft/index.scss": entry,
        "soft/_tokens.scss": TOKENS,
        "soft/blocks/footer-links.scss": BLOCK,
        "soft/dark/footer-links.scss": DARK,
      });

      expect(errors).toEqual(messages.map((message) => expect.stringContaining(message)));
    });

    it("passes a hand-written index.scss that loads every file in its place", async () => {
      const errors = await check({
        "soft/index.scss": index(load("tokens"), load("blocks/footer-links"), load("dark/footer-links")),
        "soft/_tokens.scss": TOKENS,
        "soft/blocks/footer-links.scss": BLOCK,
        "soft/dark/footer-links.scss": DARK,
      });

      expect(errors).toEqual([]);
    });

    it("reports a file index.scss loads out of its place once, at its load line", async () => {
      const entry = [
        '@use "sass:meta";',
        `@layer theme { ${load("tokens")} }`,
        "@layer vc.design {",
        `  ${SOFT} {`,
        `    ${load("dark/footer-links")}`,
        "  }",
        '  html.dark[data-design="soft"] {',
        `    ${load("blocks/footer-links")}`,
        "  }",
        "}",
      ].join("\n");
      const errors = await check({
        "soft/index.scss": entry,
        "soft/_tokens.scss": TOKENS,
        "soft/blocks/footer-links.scss": ".footer-links { margin: 0; &__a { margin: 0; } &__b { margin: 0; } }",
        "soft/dark/footer-links.scss": DARK,
      });

      expect(errors).toEqual([
        expect.stringMatching(
          /soft\/index\.scss:5 {2}"[^"]+" ships outside @layer vc\.design > html\.dark\[data-design="soft"\], where index\.scss loads dark\/footer-links$/,
        ),
        expect.stringMatching(/soft\/index\.scss:8 {2}"[^"]+" ships outside /),
      ]);
      expect(errors[1]).toContain(LIGHT_PLACE);
    });

    it("reports a rule its own block file puts out of place at the line that wrote it", async () => {
      const errors = await check({
        "soft/blocks/footer-links.scss": ".footer-links {\n  margin: 0;\n}\n\n> .footer-links { padding: 0; }",
      });

      expect(errors).toEqual([
        expect.stringMatching(
          /soft\/blocks\/footer-links\.scss:5 {2}"html\[data-design=soft\] > \.footer-links" ships outside /,
        ),
      ]);
      expect(errors[0]).toContain(LIGHT_PLACE);
    });

    it.each(["group-hover:underline", "peer-checked:underline"])(
      "reports @apply %s, which puts a selector before the design's html",
      async (variant) => {
        const errors = await check({
          "soft/blocks/footer-links.scss": `.footer-links {\n  margin: 0;\n\n  &__title {\n    @apply ${variant};\n  }\n}`,
        });

        expect(errors).toEqual([
          expect.stringMatching(
            /soft\/blocks\/footer-links\.scss:5 {2}".+": a variant that styles an ancestor or sibling \(group-\*, peer-\*\) puts a selector before html\[data-design\] and never matches; write the rule out$/,
          ),
        ]);
      },
    );

    it("reports .dark in a block file, which never matches below html", async () => {
      expect(await check({ "soft/blocks/footer-links.scss": ".footer-links { .dark & { margin: 0; } }" })).toEqual([
        expect.stringContaining(
          '".dark .footer-links": a block file names no .dark; put dark rules in dark/footer-links.scss',
        ),
      ]);
    });

    it("reports .dark in a dark file, where index.scss adds it", async () => {
      expect(await check({ "soft/dark/footer-links.scss": ".footer-links { .dark & { margin: 0; } }" })).toEqual([
        expect.stringMatching(
          /dark\/footer-links\.scss:1 {2}"\.dark \.footer-links": a dark file names no \.dark; index\.scss adds it$/,
        ),
      ]);
    });

    it("reports an @layer nested in index.scss's layers", async () => {
      const errors = await check({
        "soft/index.scss": index(
          load("tokens"),
          load("blocks/footer-links"),
          load("dark/footer-links"),
          "@layer vc.design { @layer x; }",
        ),
        "soft/_tokens.scss": TOKENS,
        "soft/blocks/footer-links.scss": BLOCK,
        "soft/dark/footer-links.scss": DARK,
      });

      expect(errors).toEqual([expect.stringContaining("@layer is not allowed in a design file")]);
    });

    it("does not report an unloaded block file that emits no rules", async () => {
      expect(await check({ "soft/index.scss": "", "soft/blocks/footer-links.scss": "$gap: 1px;" })).toEqual([]);
    });

    it("reports a copied folder that keeps another design's name", async () => {
      const errors = await check({
        "mybrand/index.scss": wiring("soft", ["_tokens.scss"]),
        "mybrand/_tokens.scss": TOKENS,
      });

      expect(errors).toContainEqual(
        expect.stringMatching(/mybrand\/index\.scss:\d+ {2}data-design="soft" must be "mybrand", the folder name/),
      );
      expect(errors).toContainEqual(
        expect.stringMatching(/mybrand\/_tokens\.scss:1 {2}data-design="soft" must be "mybrand", the folder name/),
      );
    });

    it.each([
      '@use "@/ui-kit/styles/focus-ring";',
      '@use "../../x";',
      '@forward "../../x";',
      '@import "../../x";',
      '@use "sass:meta"; @include meta.load-css("../../x");',
      '@use "sass:meta" as *; @include load-css($url: "../../" + "x");',
    ])("loads only .scss files of its own folder: %s", async (source) => {
      const errors = await check({ "_x.scss": BLOCK, "soft/blocks/footer-links.scss": `${source} ${BLOCK}` });

      expect(errors).toEqual([expect.stringContaining("is not a .scss file in")]);
    });

    it("reports a load target that resolves to no file", async () => {
      expect(await check({ "soft/index.scss": '@use "missing";' })).toEqual([
        expect.stringMatching(/soft\/index\.scss:1 .*Can't find stylesheet to import/),
      ]);
    });

    it("reports an @apply Tailwind cannot read, at its line", async () => {
      expect(await check({ "soft/blocks/footer-links.scss": ".footer-links {\n  @apply not-a-class;\n}" })).toEqual([
        expect.stringMatching(/soft\/blocks\/footer-links\.scss:2 .*not-a-class/),
      ]);
    });

    it.each([
      ["@keyframes", "@keyframes k {}"],
      ["@layer", "@layer x { .footer-links { a: b; } }"],
      ["@import", "@import url(../x.css);"],
      ["@scope", "@scope (.cart-page) { .footer-links { opacity: 0; } }"],
      ["@property", "@property --x { syntax: '<length>'; inherits: false; initial-value: 0; }"],
    ])("reports %s in a block file", async (name, block) => {
      expect(await check({ "soft/blocks/footer-links.scss": block })).toEqual([
        expect.stringContaining(`${name} is not allowed in a design file`),
      ]);
    });

    const blockPlaces = "dark-mode rules go in dark/footer-links.scss, the rest in blocks/footer-links.scss";

    it.each([
      ["@apply dark:", "blocks", ".footer-links {\n  @apply dark:underline;\n}", DARK_MEDIA, 2],
      [
        "a nested @media",
        "blocks",
        ".footer-links {\n  @media (prefers-color-scheme: dark) {\n    opacity: 0;\n  }\n}",
        DARK_MEDIA,
        2,
      ],
      [
        "a top-level @media on light",
        "blocks",
        "@media (prefers-color-scheme: light) {\n  .footer-links { opacity: 0; }\n}",
        LIGHT_MEDIA,
        1,
      ],
      [
        "a dark query with a width, which `dark:` does not write",
        "blocks",
        "@media (prefers-color-scheme: dark) and (min-width: 1px) {\n  .footer-links { opacity: 0; }\n}",
        "@media (prefers-color-scheme: dark) and (min-width: 1px) follows the OS theme, not the storefront's dark mode",
        1,
      ],
      ["@apply dark: in a dark file", "dark", ".footer-links {\n  @apply dark:underline;\n}", DARK_MEDIA, 2],
      [
        "a light @media in a dark file",
        "dark",
        "@media (prefers-color-scheme: light) {\n  .footer-links { opacity: 0; }\n}",
        LIGHT_MEDIA,
        1,
      ],
    ])(
      "reports the OS colour scheme from %s at its line, naming the dark and the block file",
      async (_name, folder, text, media, line) => {
        expect(await check({ [`soft/${folder}/footer-links.scss`]: text })).toEqual([
          expect.stringContaining(`soft/${folder}/footer-links.scss:${line}  ${osTheme(media, blockPlaces)}`),
        ]);
      },
    );

    it.each([
      ["dark", DARK_MEDIA],
      ["light", LIGHT_MEDIA],
    ])("reports the OS colour scheme on %s in _tokens.scss, naming both token roots", async (scheme, media) => {
      const tokens = `@media (prefers-color-scheme: ${scheme}) {\n  ${SOFT} { --vc-radius: 0; }\n}`;
      const places = `dark-mode tokens go on html.dark[data-design="soft"], the rest on ${SOFT}`;

      expect(await check({ "soft/_tokens.scss": tokens })).toEqual([
        expect.stringContaining(`soft/_tokens.scss:1  ${osTheme(media, places)}`),
      ]);
    });

    it.each([
      ["@apply print:", ".footer-links {\n  @apply print:hidden;\n}", "print", 2],
      ["a nested @media print", ".footer-links {\n  @media print {\n    opacity: 0;\n  }\n}", "print", 2],
      ["a top-level @media print", "@media print {\n  .footer-links { opacity: 0; }\n}", "print", 1],
      [
        "@media only print with a feature",
        "@media only print and (min-width: 1px) {\n  .footer-links { opacity: 0; }\n}",
        "only print and (min-width: 1px)",
        1,
      ],
      ["two print queries", "@media print, only print {\n  .footer-links { opacity: 0; }\n}", "print, only print", 1],
    ])("reports a print-only rule from %s at its line, pointing to vc.print", async (_name, text, params, line) => {
      expect(await check({ "soft/blocks/footer-links.scss": text })).toEqual([
        expect.stringContaining(`soft/blocks/footer-links.scss:${line}  ${printOnly(params, "a design file")}`),
      ]);
    });

    it.each([
      ["@media screen, print", "@media screen, print { .footer-links { opacity: 0; } }"],
      ["@media not print", "@media not print { .footer-links { opacity: 0; } }"],
      ["a width @media", "@media (min-width: 1px) { .footer-links { opacity: 0; } }"],
    ])("allows %s, neither print-only nor on the OS colour scheme", async (_name, text) => {
      expect(await check({ "soft/blocks/footer-links.scss": text })).toEqual([]);
    });

    it.each([
      ["a selector built by interpolation", '.vc-button { &--#{"x .vc-card"} { opacity: 0; } }'],
      ["@at-root", ".vc-button { @at-root .vc-card { opacity: 0; } }"],
      ["@extend of another block", ".vc-card { margin: 0; } .vc-button { @extend .vc-card; }"],
      ["an @apply arbitrary variant", ".vc-button { @apply [&_.vc-card]:hidden; }"],
    ])("checks the selector Sass and Tailwind emit for %s", async (_name, block) => {
      const errors = await check({ "soft/blocks/vc-button.scss": block });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.every((error) => /does not style|names \.vc-card/.test(error))).toBe(true);
    });

    it("allows a transition class on the block's own element", async () => {
      expect(
        await check({ "soft/blocks/vc-button.scss": ".vc-button.fade-enter-active { border-radius: 0; }" }),
      ).toEqual([]);
    });

    it("checks every folder, a fork's too", async () => {
      const errors = await check({
        "soft/blocks/footer-links.scss": BLOCK,
        "mybrand/blocks/vc-card.scss": ".vc-card:has(.vc-button) { margin: 0; }",
      });

      expect(errors).toEqual([
        expect.stringMatching(/mybrand\/blocks\/vc-card\.scss:1 .*names \.vc-button, another block/),
      ]);
    });

    it("reports a problem once, at the line that wrote it, also when index.scss loads the file", async () => {
      const errors = await check({
        "soft/blocks/vc-button.scss": ".vc-button {\n  --vc-button-bg: red;\n}\n.vc-card {\n  margin: 0;\n}",
      });

      expect(errors).toEqual([
        expect.stringMatching(/soft\/blocks\/vc-button\.scss:2 .*colours come only from preset variables/),
        expect.stringMatching(/soft\/blocks\/vc-button\.scss:4 .*does not style \.vc-button/),
      ]);
    });
  });

  describe("checkPresets", () => {
    let root = "";

    afterEach(() => {
      rmSync(root, { recursive: true, force: true });
    });

    const MERCURY = 'html[data-preset="mercury"]';
    const DARK_MERCURY = 'html.dark[data-preset="mercury"]';
    const SHORTHAND = "a shorthand sets geometry too, and a preset stylesheet sets colours only";

    /** Writes `presets/<file>` and a sources folder; every `<name>.scss` gets a `<name>.json` unless `json` is false. */
    async function check(files: Record<string, string>, json = true): Promise<string[]> {
      root = mkdtempSync(path.join(tmpdir(), "presets-"));

      const presetsDir = path.join(root, "presets");
      const sources = [path.join(root, "src/vc-button.vue"), path.join(root, "src/footer-links.vue")];

      mkdirSync(path.join(root, "src"), { recursive: true });
      mkdirSync(presetsDir);
      writeFileSync(sources[0], "<style>.vc-button { margin: 0; }</style>");
      writeFileSync(sources[1], "<style>.footer-links { margin: 0; }</style>");

      for (const [file, text] of Object.entries(files)) {
        writeFileSync(path.join(presetsDir, file), text);

        if (json) {
          writeFileSync(path.join(presetsDir, file.replace(/\.scss$/, ".json")), "{}");
        }
      }

      return (await checkPresets({ presetsDir, blocks: sourceBlocks(sources), semantics: colorSemantics() })).errors;
    }

    it("passes recolours of kit and app blocks in light and dark, from preset variables", async () => {
      const css = `@layer vc.preset {
        ${MERCURY} {
          .vc-button { --vc-button-bg-color: var(--color-primary-500); }
          .footer-links__title { color: var(--link-color); }
        }
        ${DARK_MERCURY} {
          .vc-button--primary:hover { background-color: color-mix(in srgb, var(--color-neutral-900) 80%, transparent); }
        }
      }`;

      expect(await check({ "mercury.scss": css })).toEqual([]);
    });

    it("passes colour tokens on the preset's html in light and dark", async () => {
      const css = `@layer vc.preset {
        ${MERCURY} { --vc-widget-bg-color: color-mix(in srgb, var(--color-additional-50) 75%, var(--color-warning-50)); }
        ${DARK_MERCURY} { --vc-widget-divide-color: var(--color-neutral-300); }
      }`;

      expect(await check({ "mercury.scss": css })).toEqual([]);
    });

    it("checks two preset stylesheets in one run and reports in file order", async () => {
      expect(
        await check({
          "red.scss": '@layer vc.preset { html[data-preset="red"] { --vc-widget-bg-color: #fff; } }',
          "mercury.scss": `@layer vc.preset { ${MERCURY} .vc-button { margin: 0; } }`,
        }),
      ).toEqual([
        expect.stringMatching(/mercury\.scss:1 .*margin: a preset stylesheet sets colours only/),
        expect.stringMatching(/red\.scss:1 .*--vc-widget-bg-color: #fff is a literal colour/),
      ]);
    });

    it("checks nothing when there is no preset stylesheet", async () => {
      root = mkdtempSync(path.join(tmpdir(), "presets-"));
      writeFileSync(path.join(root, "mercury.json"), "{}");

      expect(await checkPresets({ presetsDir: root, blocks: new Set(), semantics: new Set() })).toEqual({
        errors: [],
        fileCount: 0,
      });
    });

    it("reports a missing presets folder", async () => {
      root = mkdtempSync(path.join(tmpdir(), "presets-"));

      expect(
        await checkPresets({ presetsDir: path.join(root, "missing"), blocks: new Set(), semantics: new Set() }),
      ).toEqual({
        errors: [expect.stringContaining("missing is missing; the presets are not where this check looks")],
        fileCount: 0,
      });
    });

    it("reports a stylesheet without its preset JSON", async () => {
      expect(
        await check(
          { "ghost.scss": '@layer vc.preset { html[data-preset="ghost"] .vc-button { color: inherit; } }' },
          false,
        ),
      ).toEqual([expect.stringContaining("ghost.json is missing")]);
    });

    it("rejects a separate dark preset stylesheet", async () => {
      expect(
        await check({
          "mercury.dark.scss": `@layer vc.preset { ${DARK_MERCURY} .vc-button { color: inherit; } }`,
        }),
      ).toEqual([expect.stringContaining("dark rules go in mercury.scss under html.dark[data-preset]")]);
    });

    it("passes colour longhands and colour utilities on a block", async () => {
      const css = `@layer vc.preset {
        ${MERCURY} .vc-button { border-color: var(--color-neutral-300); @apply bg-primary-50 border-primary-500; }
      }`;

      expect(await check({ "mercury.scss": css })).toEqual([]);
    });

    it("passes a rule under @media inside the layer", async () => {
      const css = `@layer vc.preset {
        ${MERCURY} .vc-button { @media (min-width: 1px) { color: var(--color-primary-500); } }
      }`;

      expect(await check({ "mercury.scss": css })).toEqual([]);
    });

    const presetPlaces = `dark-mode rules go under ${DARK_MERCURY}, the rest under ${MERCURY}`;
    const presetPrint = printOnly("print", "a preset stylesheet");

    it.each([
      [
        "@apply dark:",
        `@layer vc.preset {\n  ${MERCURY} .vc-button {\n    @apply dark:text-primary;\n  }\n}`,
        3,
        osTheme(DARK_MEDIA, presetPlaces),
      ],
      [
        "@media on light",
        `@layer vc.preset {\n  @media (prefers-color-scheme: light) {\n    ${MERCURY} .vc-button {\n      color: inherit;\n    }\n  }\n}`,
        2,
        osTheme(LIGHT_MEDIA, presetPlaces),
      ],
      [
        "@media print",
        `@layer vc.preset {\n  ${MERCURY} .vc-button {\n    @media print {\n      color: inherit;\n    }\n  }\n}`,
        3,
        presetPrint,
      ],
      [
        "@apply print:",
        `@layer vc.preset {\n  ${MERCURY} .vc-button {\n    @apply print:text-primary;\n  }\n}`,
        3,
        presetPrint,
      ],
    ])("rejects %s inside the layer, at its line", async (_name, css, line, message) => {
      expect(await check({ "mercury.scss": css })).toEqual([
        expect.stringContaining(`mercury.scss:${line}  ${message}`),
      ]);
    });

    it("passes @media screen, print inside the layer", async () => {
      const css = `@layer vc.preset { @media screen, print { ${MERCURY} .vc-button { color: inherit; } } }`;

      expect(await check({ "mercury.scss": css })).toEqual([]);
    });

    it.each([
      ["a rule outside the layer", `${MERCURY} .vc-button { color: inherit; }`, "ships outside @layer vc.preset"],
      [
        "another layer",
        `@layer vc.design { ${MERCURY} .vc-button { color: inherit; } }`,
        "@layer is not allowed in a preset stylesheet",
      ],
      [
        "the layer inside @media",
        `@media (min-width: 1px) { @layer vc.preset { ${MERCURY} .vc-button { color: inherit; } } }`,
        "@layer is not allowed in a preset stylesheet",
      ],
      ["the layer as a bare statement", "@layer vc.preset;", "@layer is not allowed in a preset stylesheet"],
      [
        "@keyframes inside the layer",
        "@layer vc.preset { @keyframes pulse { from { opacity: 0; } } }",
        "@keyframes is not allowed in a preset stylesheet",
      ],
      [
        "a rule below another preset",
        '@layer vc.preset { html[data-preset="red"] .vc-button { color: inherit; } }',
        "a preset stylesheet sets tokens on",
      ],
      [
        "a token on another preset's html",
        '@layer vc.preset { html[data-preset="red"] { --vc-widget-bg-color: var(--color-additional-50); } }',
        "a preset stylesheet sets tokens on",
      ],
      [
        "a property that is not a token on the preset's html",
        `@layer vc.preset { ${MERCURY} { color: var(--color-primary-500); } }`,
        "color: the preset's html takes public --vc-* tokens only",
      ],
      [
        "a preset key on the preset's html",
        `@layer vc.preset { ${DARK_MERCURY} { --color-primary-500: var(--color-danger-500); } }`,
        "--color-primary-500: the preset's html takes public --vc-* tokens only",
      ],
      [
        "a public token that is not a colour on the preset's html",
        `@layer vc.preset { ${MERCURY} { --vc-widget-radius: 0; } }`,
        "--vc-widget-radius: a preset stylesheet sets colours only",
      ],
      [
        "a selector that styles no block",
        `@layer vc.preset { ${MERCURY} .vc-button svg { color: inherit; } }`,
        "styles no block",
      ],
      [
        "a property that is not a colour",
        `@layer vc.preset { ${MERCURY} .vc-button { margin: 0; } }`,
        "margin: a preset stylesheet sets colours only",
      ],
      [
        "a public token that is not a colour",
        `@layer vc.preset { ${MERCURY} .vc-button { --vc-button-radius: 0; } }`,
        "--vc-button-radius: a preset stylesheet sets colours only",
      ],
      [
        "a border and a box-shadow shorthand, which set geometry too",
        `@layer vc.preset { ${MERCURY} .vc-button { border: 2px dashed var(--color-neutral-300); box-shadow: 0 20px 40px 0 var(--color-neutral-950); } }`,
        `border, box-shadow: ${SHORTHAND}: set border-color, not border`,
      ],
      [
        "an outline shorthand",
        `@layer vc.preset { ${MERCURY} .vc-button { outline: 3px solid var(--color-primary-500); } }`,
        `outline: ${SHORTHAND}: set outline-color, not outline`,
      ],
      [
        "a background shorthand",
        `@layer vc.preset { ${MERCURY} .vc-button { background: var(--color-primary-50) url("x.png") no-repeat; } }`,
        `background: ${SHORTHAND}: set background-color, not background`,
      ],
      [
        "a background shorthand that holds only a colour",
        `@layer vc.preset { ${MERCURY} .vc-button { background: var(--color-primary-50); } }`,
        `background: ${SHORTHAND}: set background-color, not background`,
      ],
      [
        "a border side shorthand",
        `@layer vc.preset { ${MERCURY} .vc-button { border-inline-start: 1px solid var(--color-neutral-300); } }`,
        `border-inline-start: ${SHORTHAND}: set border-inline-start-color, not border-inline-start`,
      ],
      [
        "a shadow shorthand, which has no colour longhand",
        `@layer vc.preset { ${MERCURY} .vc-button { box-shadow: 0 0 4px var(--color-neutral-950); } }`,
        `box-shadow: ${SHORTHAND}; box-shadow has no colour longhand`,
      ],
      [
        "a filter, which has no colour longhand",
        `@layer vc.preset { ${MERCURY} .vc-button { filter: drop-shadow(0 0 4px var(--color-neutral-950)); } }`,
        `filter: ${SHORTHAND}; filter has no colour longhand`,
      ],
      [
        "a prefixed border side shorthand",
        `@layer vc.preset { ${MERCURY} .vc-button { -webkit-border-before: 1px solid var(--color-neutral-300); } }`,
        `-webkit-border-before: ${SHORTHAND}: set -webkit-border-before-color, not -webkit-border-before`,
      ],
      [
        "a shorthand that holds no colour",
        `@layer vc.preset { ${MERCURY} .vc-button { background: url("x.png") no-repeat; } }`,
        "background: a preset stylesheet sets colours only",
      ],
      [
        "a shadow token, which sets geometry too",
        `@layer vc.preset { ${MERCURY} { --vc-widget-shadow: 0 0 4px var(--color-primary-500); } }`,
        "--vc-widget-shadow: a preset stylesheet sets colours only",
      ],
      [
        "a private variable",
        `@layer vc.preset { ${MERCURY} .vc-button { --bg-color: var(--color-primary-500); } }`,
        "--bg-color: a private variable",
      ],
      [
        "a literal colour",
        `@layer vc.preset { ${MERCURY} .vc-button { color: #fff; } }`,
        "color: #fff is a literal colour; colours come only from preset variables",
      ],
    ])("reports %s", async (_name, css, message) => {
      expect(await check({ "mercury.scss": css })).toEqual([expect.stringContaining(message)]);
    });
  });
});
