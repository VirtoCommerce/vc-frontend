import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, reactive } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import MainLayout from "./main-layout.vue";
import VcFrame from "@/ui-kit/components/templates/frame/vc-frame.vue";

vi.mock("vue-router", () => ({ useRoute: () => reactive({ path: "/" }) }));

vi.mock("@/shared/layout/components/header/vc-header.vue", () => ({
  default: defineComponent({ name: "VcHeader", setup: () => () => h("header", { class: "header-stub" }) }),
}));

vi.mock("@/shared/layout/components/footer/vc-footer.vue", () => ({
  default: defineComponent({ name: "VcFooter", setup: () => () => h("footer", { id: "footer" }) }),
}));

const createWrapper = createWrapperFactory(mount, MainLayout, {
  global: { components: { VcFrame } },
  slots: { default: '<p class="page">page</p>' },
});

enableAutoUnmount(afterEach);

describe("MainLayout", () => {
  it("renders exactly one main#main-content with the page in it", () => {
    const wrapper = createWrapper();
    const mains = wrapper.findAll("main");

    expect(mains).toHaveLength(1);
    expect(mains[0].attributes("id")).toBe("main-content");
    expect(mains[0].find(".page").exists()).toBe(true);
  });

  it("renders the skip link to #main-content before the main region", () => {
    const wrapper = createWrapper();
    const link = wrapper.get('a[href="#main-content"]');
    const main = wrapper.get("#main-content");

    expect(main.element.tagName).toBe("MAIN");
    expect(link.element.compareDocumentPosition(main.element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
