import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h, ref } from "vue";
import { CUSTOM_SECTION_STYLE_ATTRIBUTE, useCustomSectionStyle } from "./useCustomSectionStyle";
import type { VueWrapper } from "@vue/test-utils";

const css = ref(".card { color: var(--color-primary-500); }");
const assetsBaseUrl = ref<string | undefined>("https://cdn.example.com/assets");

const Section = defineComponent({
  props: { type: { type: String, required: true } },

  setup(props) {
    useCustomSectionStyle(
      () => props.type,
      () => css.value,
      () => assetsBaseUrl.value,
    );
    return () => h("section");
  },
});

/** Mounted and not yet unmounted: what a failed test leaves is unmounted after it, so its CSS goes too. */
const mounted = new Set<VueWrapper>();

function mountSection(type: string): VueWrapper {
  const wrapper = mount(Section, { props: { type } });
  mounted.add(wrapper);
  return wrapper;
}

function unmountSection(wrapper: VueWrapper): void {
  mounted.delete(wrapper);
  wrapper.unmount();
}

function findStyles(type: string): HTMLStyleElement[] {
  return [...document.head.querySelectorAll<HTMLStyleElement>(`style[${CUSTOM_SECTION_STYLE_ATTRIBUTE}="${type}"]`)];
}

describe("useCustomSectionStyle", () => {
  afterEach(() => {
    [...mounted].forEach(unmountSection);
    css.value = ".card { color: var(--color-primary-500); }";
    assetsBaseUrl.value = "https://cdn.example.com/assets";
  });

  it("puts a type's CSS in the page once, scoped to its sections in the custom-sections layer", () => {
    mountSection("custom-hero");
    mountSection("custom-hero");
    const styles = findStyles("custom-hero");

    expect(styles).toHaveLength(1);
    expect(styles[0].textContent?.replaceAll(/\s+/g, " ")).toBe(
      '@layer custom-sections { @scope ([data-sb-type="custom-hero"]) { .card { color: var(--color-primary-500); } } }',
    );
  });

  it("puts keyframes written in a condition inside the layer, beside the scope, with the condition", () => {
    css.value =
      "@media (prefers-reduced-motion: no-preference) { @keyframes custom-hero__in { from { opacity: 0; } } " +
      ".card { animation: 1s custom-hero__in; } }";
    mountSection("custom-hero");

    expect(findStyles("custom-hero")[0].textContent?.replaceAll(/\s+/g, " ")).toMatch(
      /^@layer custom-sections \{ @media \(prefers-reduced-motion: no-preference\) \{ @keyframes custom-hero__in \{.*\} \} @scope \(\[data-sb-type="custom-hero"\]\) \{ @media \(prefers-reduced-motion: no-preference\) \{ \.card \{ animation: .*custom-hero__in.*\} \} \} \}$/,
    );
  });

  it("writes the CSS again when the asset library changes", async () => {
    css.value = '.card { background-image: url("https://cdn.example.com/assets/a.png"); }';
    const wrapper = mountSection("custom-hero");
    expect(findStyles("custom-hero")[0].textContent).toContain("assets/a.png");

    assetsBaseUrl.value = "https://cdn.example.com/other";
    await wrapper.vm.$nextTick();

    expect(findStyles("custom-hero")[0].textContent).not.toContain("assets/a.png");
  });

  it("removes the CSS when the last section of the type goes", () => {
    const first = mountSection("custom-hero");
    const second = mountSection("custom-hero");

    unmountSection(first);
    expect(findStyles("custom-hero")).toHaveLength(1);

    unmountSection(second);
    expect(findStyles("custom-hero")).toHaveLength(0);
  });

  it("follows a changed CSS", async () => {
    const wrapper = mountSection("custom-hero");

    css.value = ".card { margin: 0; }";
    await wrapper.vm.$nextTick();

    expect(findStyles("custom-hero")[0].textContent).toContain(".card { margin: 0px; }");
  });

  it("moves a mounted section's CSS when its type changes, and lets the old one go", async () => {
    const wrapper = mountSection("custom-hero");

    await wrapper.setProps({ type: "custom-stats" });

    expect(findStyles("custom-hero")).toHaveLength(0);
    expect(findStyles("custom-stats")[0].textContent).toContain('[data-sb-type="custom-stats"]');
    unmountSection(wrapper);
    expect(findStyles("custom-stats")).toHaveLength(0);
  });
});
