// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  checkBlockSelector,
  checkDesigns,
  checkForeignBlocks,
  checkTokensSelector,
  definedBlocks,
} from "./check-designs.js";
import type { IDesignCheckOptions } from "./check-designs.js";

const SOFT = 'html[data-design="soft"]';
const TOKENS_ONLY = `_tokens.scss sets tokens only on ${SOFT} or html.dark[data-design="soft"]`;

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

      return { designsDir, sources: Object.keys(SOURCES).map((file) => path.join(root, file)) };
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

    it("reports colour tokens in _tokens.scss and in block files, also through an escaped or interpolated name", async () => {
      const errors = await check({
        "soft/_tokens.scss": String.raw`${SOFT} { --vc-x-bg: 1; #{"--x-c\\6f lor"}: 1; --vc-radius: 1rem; }`,
        "soft/blocks/vc-button.scss": String.raw`.vc-button {
          --vc-button-bg-color: 1;
          --vc-button-b\67: 1;
          #{"--vc-button-b\\g"}: 1;
          -\-vc-button-bg-color: 1;
          \2d\2d vc-button-bg-color: 1;
          --vc-button-solid-primary-text: 1;
          --vc-button-solid-primary-border: 1;
          --vc-button-solid-primary-icon: 1;
          --vc-button-border-width: 0;
          --vc-button-text-transform: none;
          #{"\\110000-x"}: 1;
          --vc-button-icon-size: 1rem;
        }`,
      });

      expect(errors).toEqual([
        expect.stringContaining(String.raw`--vc-x-bg, --x-c\6f lor: colour tokens belong to presets`),
        expect.stringContaining("--vc-button-bg-color: colour tokens belong to presets"),
        expect.stringContaining("--vc-button-bg: colour tokens belong to presets"),
        expect.stringContaining(String.raw`--vc-button-b\g: colour tokens belong to presets`),
        expect.stringContaining(String.raw`-\-vc-button-bg-color: colour tokens belong to presets`),
        expect.stringContaining(String.raw`\--vc-button-bg-color: colour tokens belong to presets`),
        expect.stringContaining("--vc-button-solid-primary-text: colour tokens belong to presets"),
        expect.stringContaining("--vc-button-solid-primary-border: colour tokens belong to presets"),
        expect.stringContaining("--vc-button-solid-primary-icon: colour tokens belong to presets"),
      ]);
    });

    const COLOR = "colours come from the preset";

    it.each([
      ["a colour property", "blocks", "color: red", ["color"]],
      ["an applied text colour", "blocks", "@apply text-primary-500", ["color", "--tw-text-opacity"]],
      ["an applied background colour", "blocks", "@apply bg-primary-500", ["background-color", "--tw-bg-opacity"]],
      ["an applied text opacity", "blocks", "@apply text-opacity-50", ["--tw-text-opacity"]],
      ["an applied background opacity", "blocks", "@apply bg-opacity-50", ["--tw-bg-opacity"]],
      ["a border colour in a dark file", "dark", "border-top-color: red", ["border-top-color"]],
      [
        "any …-color property",
        "blocks",
        "scrollbar-color: red blue; -webkit-text-fill-color: red",
        ["scrollbar-color", "-webkit-text-fill-color"],
      ],
      ["a colour property set from a variable", "blocks", "fill: var(--x)", ["fill"]],
      ["a background shorthand", "blocks", "background: red", ["background"]],
      ["a colour variable in a shorthand", "blocks", "background: var(--color-primary-500)", ["background"]],
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
      ["an applied gradient stop", "blocks", "@apply from-primary-500", ["--tw-gradient-from", "--tw-gradient-to"]],
      [
        "an applied gradient with its stop",
        "blocks",
        "@apply bg-gradient-to-r from-primary-500",
        ["--tw-gradient-from", "--tw-gradient-to"],
      ],
    ])("reports %s once, naming the properties its line sets", async (_name, dir, declarations, props) => {
      const errors = await check({ [`soft/${dir}/footer-links.scss`]: `.footer-links { ${declarations}; }` });

      expect(errors).toEqual([expect.stringMatching(new RegExp(`:1 {2}${props.join(", ")}: ${COLOR}$`))]);
    });

    it("reports an applied ring colour once, with its colour token", async () => {
      expect(await check({ "soft/blocks/footer-links.scss": ".footer-links { @apply ring-primary-500; }" })).toEqual([
        expect.stringMatching(new RegExp(`:1 {2}--tw-ring-opacity, --tw-ring-color: ${COLOR}$`)),
      ]);
    });

    it("reports colours on different lines of one rule apart", async () => {
      const errors = await check({
        "soft/blocks/footer-links.scss": ".footer-links {\n  color: red;\n  @apply bg-primary-500;\n}",
      });

      expect(errors).toEqual([
        expect.stringMatching(new RegExp(`:2 {2}color: ${COLOR}$`)),
        expect.stringMatching(new RegExp(`:3 {2}background-color, --tw-bg-opacity: ${COLOR}$`)),
      ]);
    });

    it.each([
      "@apply shadow-md",
      "@apply ring-2",
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
        expect.stringMatching(/soft\/blocks\/vc-button\.scss:2 .*colour tokens belong to presets/),
        expect.stringMatching(/soft\/blocks\/vc-button\.scss:4 .*does not style \.vc-button/),
      ]);
    });
  });
});
