import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { mount } from "@vue/test-utils";
import postcss from "postcss";
import { compileString } from "sass";
import { describe, expect, it } from "vitest";
import { parse } from "vue/compiler-sfc";
import VcButton from "./vc-button.vue";
import type { ComponentMountingOptions } from "@vue/test-utils";

// The root alone: the root, its layout modifiers and its min-width rule
const ROOT_ALONE = /^\.vc-button(?:--(?:icon|square|full-width)|:not\([^)]*\))?$/;
const CUSTOM_PROPERTY = /^--/;

function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
}

type CompiledRuleType = { selectors: string[]; styles: string[] };

function compiledRules(scss: string): CompiledRuleType[] {
  const rules: CompiledRuleType[] = [];

  postcss.parse(compileString(scss).css).walkRules((rule) => {
    const styles: string[] = [];

    rule.each((node) => {
      if (node.type === "decl") {
        styles.push(node.prop);
      } else if (node.type === "atrule") {
        styles.push(`@${node.name}`);
      }
    });

    rules.push({ selectors: rule.selectors, styles });
  });

  return rules;
}

function isStyledAtOneClass({ selectors, styles }: CompiledRuleType): boolean {
  return (
    selectors.some((selector) => ROOT_ALONE.test(selector)) && styles.some((style) => !CUSTOM_PROPERTY.test(style))
  );
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

  // A kit parent's single class must lay the root out in any load order, screen and print alike.
  it.each([
    ["component", parse(readSource("./vc-button.vue")).descriptor.styles[0].content],
    ["print", readSource("../../../../assets/styles/print/atoms/vc-button.scss")],
  ])("keeps the root's own %s rules in :where()", (_, scss) => {
    const rules = compiledRules(scss);

    expect(rules.filter(isStyledAtOneClass)).toEqual([]);
    expect(rules).toContainEqual({ selectors: [":where(.vc-button)"], styles: expect.arrayContaining(["@apply"]) });
  });
});
