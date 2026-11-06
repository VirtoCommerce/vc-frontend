import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { mount } from "@vue/test-utils";
import postcss, { AtRule } from "postcss";
import { compileString } from "sass";
import { describe, expect, it } from "vitest";
import { parse } from "vue/compiler-sfc";
import VcButton from "./vc-button.vue";
import type { ComponentMountingOptions } from "@vue/test-utils";

const CUSTOM_PROPERTY = /^--/;
const WHERE = /:where\(/;
const WHERE_WRAPPED = /^:where\((.+)\)$/;

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
            "@apply relative inline-block px-[--px] rounded-[--radius] border-2 select-none text-center bg-[--bg-color] border-[--border-color] text-[--text-color]",
            "appearance: button",
          ],
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
        {
          media: "",
          selector: ":where(.vc-button:not(.vc-button--icon, .vc-button--square))",
          styles: ["@apply min-w-[--min-w]"],
        },
        {
          media: "@media (prefers-reduced-motion: no-preference)",
          selector: ":where(.vc-button)",
          styles: ["@apply transition-colors"],
        },
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

    it("declare nothing but custom properties on the same selectors outside :where()", () => {
      const bareSelectors = new Set(whereRules.map(({ selector }) => WHERE_WRAPPED.exec(selector)?.[1]));
      const styledBare = rules.filter(
        ({ selector, styles }) => bareSelectors.has(selector) && styles.some((style) => !CUSTOM_PROPERTY.test(style)),
      );

      expect(styledBare).toEqual([]);
    });
  });
});
