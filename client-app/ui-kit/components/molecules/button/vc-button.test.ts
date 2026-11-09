import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mount } from "@vue/test-utils";
import postcss, { AtRule } from "postcss";
import selectorParser from "postcss-selector-parser";
import { compileString } from "sass";
import tailwindcss from "tailwindcss";
import loadConfig from "tailwindcss/loadConfig.js";
import { describe, expect, it } from "vitest";
import { parse } from "vue/compiler-sfc";
import VcButton from "./vc-button.vue";
import type { ComponentMountingOptions } from "@vue/test-utils";

const WHERE = /:where\(/;
const ROOT_CLASS = /^vc-button(?:--|$)/;
const LAYOUT_PROPERTIES = new Set([
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "width",
  "min-width",
  "max-width",
  "height",
  "min-height",
  "max-height",
  "gap",
  "row-gap",
  "column-gap",
  "align-self",
  "justify-self",
  "order",
]);
const LAYOUT_PREFIX = /^(?:inset|margin|padding|flex|grid)(?:-|$)/;

const tailwind = tailwindcss({
  // Not `new URL("…", import.meta.url)`: Vite rewrites that literal form into an http:// dev-server URL.
  ...loadConfig(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../../tailwind.config.ts")),
  content: [{ raw: "" }],
});

function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
}

type CompiledRuleType = { media: string; selector: string; styles: string[] };

function compiledRules(scss: string): CompiledRuleType[] {
  const rules: CompiledRuleType[] = [];

  postcss.parse(compileString(scss).css).walkRules((rule) => {
    const styles: string[] = [];

    rule.each((node) => {
      if (node.type === "decl") {
        styles.push(`${node.prop}: ${node.value}`);
      } else if (node.type === "atrule") {
        styles.push(`@${node.name} ${node.params}`);
      }
    });

    const media = rule.parent instanceof AtRule ? `@${rule.parent.name} ${rule.parent.params}` : "";

    rules.push({ media, selector: rule.selectors.join(", "), styles });
  });

  return rules;
}

function hasRootSubject(ruleSelector: string): boolean {
  let found = false;

  selectorParser((root) => {
    root.each((selector) => {
      const subject = selector.nodes.slice(selector.nodes.map((node) => node.type).lastIndexOf("combinator") + 1);

      found ||= subject.some((node) => node.type === "class" && ROOT_CLASS.test(node.value));
    });
  }).processSync(ruleSelector);

  return found;
}

async function layoutOnRoot(scss: string): Promise<string[]> {
  const found: string[] = [];

  const { root } = await postcss([tailwind]).process(compileString(scss).css, { from: undefined });

  root.walkDecls((decl) => {
    const rule = decl.parent;
    const isLayout = LAYOUT_PROPERTIES.has(decl.prop) || LAYOUT_PREFIX.test(decl.prop);

    if (isLayout && rule?.type === "rule" && hasRootSubject(rule.selector)) {
      found.push(`${rule.selector} { ${decl.prop} }`);
    }
  });

  return found;
}

function mountButton(options: ComponentMountingOptions<typeof VcButton> = {}) {
  return mount(VcButton, { ...options, global: { stubs: { VcIcon: true } } });
}

describe("VcButton", () => {
  describe("loading state", () => {
    it("marks the button busy and disabled and keeps the slot label", () => {
      const wrapper = mountButton({ props: { loading: true }, slots: { default: "Browse files" } });

      expect(wrapper.attributes("aria-busy")).toBe("true");
      expect(wrapper.attributes("disabled")).toBeDefined();
      expect(wrapper.find(".vc-button__slot").text()).toBe("Browse files");
    });

    it.each([
      ["ariaLabel", { ariaLabel: "Add to cart" }, "Add to cart"],
      ["title", { title: "Remove item" }, "Remove item"],
    ])("keeps the %s as the accessible name", (_, props, expected) => {
      const wrapper = mountButton({ props: { ...props, icon: "cart", loading: true } });

      expect(wrapper.attributes("aria-label")).toBe(expected);
      expect(wrapper.attributes("aria-busy")).toBe("true");
    });

    it.each([
      ["to", { to: "/cart" }],
      ["externalLink", { externalLink: "https://example.com" }],
    ])("renders a busy disabled button instead of a %s link", (_, props) => {
      const wrapper = mountButton({ props: { ...props, loading: true }, slots: { default: "Open" } });

      expect(wrapper.element.tagName).toBe("BUTTON");
      expect(wrapper.attributes("disabled")).toBeDefined();
      expect(wrapper.attributes("aria-busy")).toBe("true");
      expect(wrapper.attributes("href")).toBeUndefined();
    });
  });

  it("does not set aria-busy when not loading", () => {
    const wrapper = mountButton({ slots: { default: "Browse files" } });

    expect(wrapper.attributes("aria-busy")).toBeUndefined();
  });

  describe.each([
    [
      "vc-button.vue",
      parse(readSource("./vc-button.vue")).descriptor.styles[0].content,
      [
        {
          media: "",
          selector: ":where(.vc-button)",
          styles: [
            "@apply relative inline-block px-[--px] min-w-[--min-w] rounded-[--radius] border-2 select-none text-center bg-[--bg-color] border-[--border-color] text-[--text-color]",
            "appearance: button",
          ],
        },
        {
          media: "@media (prefers-reduced-motion: no-preference)",
          selector: ":where(.vc-button)",
          styles: ["@apply transition-colors"],
        },
        {
          media: "",
          selector: ":where(.vc-button--icon)",
          styles: ["@apply flex-none p-0 h-[--size] min-w-[var(--min-w,var(--size))]"],
        },
        {
          media: "",
          selector: ":where(.vc-button--square)",
          styles: ["@apply flex-none px-0.5 h-[--size] min-w-[var(--min-w,var(--size))]"],
        },
        { media: "", selector: ":where(.vc-button--full-width)", styles: ["@apply w-full"] },
      ],
    ],
    [
      "print/atoms/vc-button.scss",
      readSource("../../../../assets/styles/print/atoms/vc-button.scss"),
      [{ media: "", selector: ":where(.vc-button)", styles: ["@apply hidden"] }],
    ],
  ])("%s styles", (_, scss, whereRules: CompiledRuleType[]) => {
    const rules = compiledRules(scss);

    it("compile to exactly the listed :where() rules, each with its media and declarations", () => {
      expect(rules.filter(({ selector }) => WHERE.test(selector))).toEqual(whereRules);
    });

    it("set no layout property where a .vc-button or .vc-button--* class is the subject outside a pseudo-class argument", async () => {
      expect(await layoutOnRoot(scss)).toEqual([]);
    });
  });
});
