import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, reactive, ref } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import SecureLayout from "./secure-layout.vue";
import VcFrame from "@/ui-kit/components/templates/frame/vc-frame.vue";

const { headerHeight } = await vi.hoisted(async () => {
  const vue = await import("vue");
  return { headerHeight: vue.ref(56) };
});

vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useElementBounding: () => ({ height: headerHeight }),
}));

vi.mock("vue-router", () => ({ useRoute: () => reactive({ path: "/cart" }) }));

vi.mock("@/core/composables", () => ({ useWhiteLabeling: () => ({ logoUrl: ref("/logo.svg") }) }));

vi.mock("../footer/vc-footer.vue", () => ({
  default: defineComponent({ name: "VcFooter", setup: () => () => h("footer", { id: "footer" }) }),
}));

vi.mock("../print/created.vue", () => ({
  default: defineComponent({ name: "Created", setup: () => () => null }),
}));

const createWrapper = createWrapperFactory(mount, SecureLayout, {
  global: {
    components: { VcFrame },
    stubs: { VcImage: true, VcIcon: true },
    mocks: { $context: { storeName: "Store" } },
  },
  slots: { default: '<p class="page">page</p>' },
});

enableAutoUnmount(afterEach);

describe("SecureLayout", () => {
  afterEach(() => {
    headerHeight.value = 56;
    document.documentElement.style.removeProperty("--vc-app-header-height");
  });

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

  it("publishes its sticky header's height as --vc-app-header-height and keeps it current", async () => {
    createWrapper();

    expect(document.documentElement.style.getPropertyValue("--vc-app-header-height")).toBe("56px");

    headerHeight.value = 88;
    await nextTick();

    expect(document.documentElement.style.getPropertyValue("--vc-app-header-height")).toBe("88px");
  });
});
