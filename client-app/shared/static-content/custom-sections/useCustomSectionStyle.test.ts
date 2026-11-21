import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h, ref } from "vue";
import { CUSTOM_SECTION_STYLE_ATTRIBUTE, useCustomSectionStyle } from "./useCustomSectionStyle";

const css = ref(".card { color: var(--color-primary-500); }");

const Section = defineComponent({
  props: { type: { type: String, required: true } },

  setup(props) {
    useCustomSectionStyle(
      () => props.type,
      () => css.value,
    );
    return () => h("section");
  },
});

function findStyles(type: string): HTMLStyleElement[] {
  return [...document.head.querySelectorAll<HTMLStyleElement>(`style[${CUSTOM_SECTION_STYLE_ATTRIBUTE}="${type}"]`)];
}

describe("useCustomSectionStyle", () => {
  afterEach(() => {
    css.value = ".card { color: var(--color-primary-500); }";
    document.head.innerHTML = "";
  });

  it("puts a type's CSS in the page once, scoped to its sections in the sections layer", () => {
    const first = mount(Section, { props: { type: "custom-hero" } });
    const second = mount(Section, { props: { type: "custom-hero" } });
    const styles = findStyles("custom-hero");

    expect(styles).toHaveLength(1);
    expect(styles[0].textContent?.replaceAll(/\s+/g, " ")).toBe(
      '@layer sections { @scope ([data-sb-type="custom-hero"]) { .card { color: var(--color-primary-500); } } }',
    );

    first.unmount();
    second.unmount();
  });

  it("removes the CSS when the last section of the type goes", () => {
    const first = mount(Section, { props: { type: "custom-hero" } });
    const second = mount(Section, { props: { type: "custom-hero" } });

    first.unmount();
    expect(findStyles("custom-hero")).toHaveLength(1);

    second.unmount();
    expect(findStyles("custom-hero")).toHaveLength(0);
  });

  it("follows a changed CSS", async () => {
    const wrapper = mount(Section, { props: { type: "custom-hero" } });

    css.value = ".card { margin: 0; }";
    await wrapper.vm.$nextTick();

    expect(findStyles("custom-hero")[0].textContent).toContain(".card { margin: 0px; }");
    wrapper.unmount();
  });
});
