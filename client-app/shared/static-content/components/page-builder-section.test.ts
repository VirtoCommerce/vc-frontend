import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineAsyncComponent, defineComponent, h } from "vue";
import PageBuilderSection from "./page-builder-section.vue";
import type { Component } from "vue";

const Section = defineComponent({
  props: { title: { type: String, default: "" } },

  setup(props) {
    return () => h("section", { "data-test-id": "page-builder-test-section" }, props.title);
  },
});

const MALICIOUS_ITEM = {
  id: "1",
  type: "test",
  title: "Hello",
  onerror: "alert(1)",
  onmouseover: "alert(1)",
  style: "position: fixed",
  href: "javascript:alert(1)",
};

function mountSection(component: Component | undefined, item: Record<string, unknown> = MALICIOUS_ITEM) {
  return mount(PageBuilderSection, { props: { component, item }, attrs: { id: "anchor-1" } });
}

describe("PageBuilderSection", () => {
  it("passes declared props and host attributes", () => {
    const wrapper = mountSection(Section);
    const section = wrapper.find('[data-test-id="page-builder-test-section"]');

    expect(section.text()).toBe("Hello");
    expect(section.attributes("id")).toBe("anchor-1");
  });

  it("does not render undeclared item keys as attributes", () => {
    const section = mountSection(Section).find('[data-test-id="page-builder-test-section"]');

    expect(Object.keys(section.attributes()).sort((a, b) => a.localeCompare(b))).toEqual(["data-test-id", "id"]);
  });

  it("renders nothing without a registered component", () => {
    expect(mountSection(undefined).html()).toBe("<!--v-if-->");
  });

  it("renders a lazy section with its declared props only", async () => {
    const wrapper = mountSection(defineAsyncComponent(() => Promise.resolve(Section)));

    await flushPromises();

    const section = wrapper.find('[data-test-id="page-builder-test-section"]');
    expect(section.text()).toBe("Hello");
    expect(Object.keys(section.attributes()).sort((a, b) => a.localeCompare(b))).toEqual(["data-test-id", "id"]);
  });
});
