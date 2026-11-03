import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineAsyncComponent, defineComponent, h, nextTick } from "vue";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { registerPageBuilderSections } from "../sections";
import PageBuilderSection from "./page-builder-section.vue";
import type { Component } from "vue";

const intersection = vi.hoisted(() => ({ callback: undefined as ((entries: unknown[]) => void) | undefined }));

vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useIntersectionObserver: (_target: unknown, callback: (entries: unknown[]) => void) => {
    intersection.callback = callback;
    return { stop: vi.fn() };
  },
}));

const Section = defineComponent({
  props: { title: { type: String, default: "" } },

  setup(props) {
    return () => h("section", { "data-test-id": "page-builder-test-section" }, props.title);
  },
});

const ProductSection = defineComponent({
  props: { product: { type: Object, default: undefined }, title: { type: String, default: "" } },

  setup(props) {
    return () =>
      h("section", { "data-test-id": "page-builder-product-section" }, `${props.title}:${props.product?.name}`);
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

  describe("without a component", () => {
    afterEach(() => {
      ["test", "text", "text-block", "late"].forEach((type) =>
        useExtensionRegistry().unregister("pageBuilderSection", type),
      );
    });

    it("renders the section registered for the item's type, aliases included", () => {
      registerPageBuilderSections({ "text-block": Section });

      const wrapper = mountSection(undefined, { id: "1", type: "text", title: "Aliased" });

      expect(wrapper.find('[data-test-id="page-builder-test-section"]').text()).toBe("Aliased");
    });

    it("renders a section registered after it mounted", async () => {
      const wrapper = mountSection(undefined, { id: "1", type: "late", title: "Late" });
      expect(wrapper.find('[data-test-id="page-builder-test-section"]').exists()).toBe(false);

      registerPageBuilderSections({ late: Section });
      await nextTick();

      expect(wrapper.find('[data-test-id="page-builder-test-section"]').text()).toBe("Late");
    });

    it("does not resolve an Object.prototype member as a type", () => {
      expect(mountSection(undefined, { id: "1", type: "constructor" }).html()).toBe("<!--v-if-->");
    });
  });

  it("passes the host's data only when declared, over the item's keys", () => {
    const wrapper = mount(PageBuilderSection, {
      props: {
        component: ProductSection,
        item: { id: "1", type: "test", title: "T", product: { name: "forged" } },
        context: { product: { name: "Real" }, unknownHostData: "x" },
      },
    });
    const section = wrapper.find('[data-test-id="page-builder-product-section"]');

    expect(section.text()).toBe("T:Real");
    expect(section.attributes("unknownhostdata")).toBeUndefined();
  });

  it("mounts a lazy section when it comes near the viewport, keeping its anchor", async () => {
    const wrapper = mount(PageBuilderSection, {
      props: { component: Section, item: { id: "1", type: "test", title: "Below" }, lazy: true },
      attrs: { id: "anchor-1" },
    });

    expect(wrapper.find('[data-test-id="page-builder-test-section"]').exists()).toBe(false);
    expect(wrapper.find("#anchor-1").exists()).toBe(true);

    intersection.callback?.([{ isIntersecting: true }]);
    await nextTick();

    expect(wrapper.find('[data-test-id="page-builder-test-section"]').text()).toBe("Below");
  });
});
