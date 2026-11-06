import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
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

    expect(section.attributes()).toEqual({ "data-test-id": "page-builder-test-section", id: "anchor-1" });
  });

  it("renders nothing without a registered component", () => {
    expect(mountSection(undefined).html()).toBe("<!--v-if-->");
  });

  it("renders a lazy section with its declared props only", async () => {
    const wrapper = mountSection(defineAsyncComponent(() => Promise.resolve(Section)));

    await flushPromises();

    const section = wrapper.find('[data-test-id="page-builder-test-section"]');
    expect(section.text()).toBe("Hello");
    expect(section.attributes()).toEqual({ "data-test-id": "page-builder-test-section", id: "anchor-1" });
  });

  it("loads a lazy section again after a failed load", async () => {
    const loader = vi
      .fn<() => Promise<Component>>()
      .mockRejectedValueOnce(new Error("chunk failed"))
      .mockResolvedValue(Section);
    const LazySection = defineAsyncComponent(loader);
    const errorHandler = vi.fn();
    const mountLazySection = () =>
      mount(PageBuilderSection, {
        props: { component: LazySection, item: MALICIOUS_ITEM },
        global: { config: { errorHandler } },
      });

    const failed = mountLazySection();
    await flushPromises();
    failed.unmount();

    const wrapper = mountLazySection();
    await flushPromises();

    expect(errorHandler).toHaveBeenCalledOnce();
    expect(loader).toHaveBeenCalledTimes(2);
    expect(wrapper.find('[data-test-id="page-builder-test-section"]').text()).toBe("Hello");
  });

  it("gives every section of a lazy type its props on its first setup", async () => {
    const setupTitles: Array<string | undefined> = [];
    const RecordingSection = defineComponent({
      props: { title: { type: String, default: undefined } },

      setup(props) {
        // eslint-disable-next-line vue/no-setup-props-reactivity-loss -- records what the first setup run receives
        setupTitles.push(props.title);
        return () => h("section", props.title);
      },
    });
    const LazySection = defineAsyncComponent(() => Promise.resolve(RecordingSection));

    mount(() => [
      h(PageBuilderSection, { component: LazySection, item: { title: "First" } }),
      h(PageBuilderSection, { component: LazySection, item: { title: "Second" } }),
    ]);
    await flushPromises();

    expect(setupTitles).toEqual(["First", "Second"]);
  });
});
