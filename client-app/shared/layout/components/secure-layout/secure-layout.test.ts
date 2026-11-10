import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, reactive, ref, toValue } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import SecureLayout from "./secure-layout.vue";
import type { VueWrapper } from "@vue/test-utils";
import VcFrame from "@/ui-kit/components/templates/frame/vc-frame.vue";

const { headerHeight, measured } = await vi.hoisted(async () => {
  const vue = await import("vue");
  const measuredTarget: { target?: unknown } = {};
  return { headerHeight: vue.ref(0), measured: measuredTarget };
});

vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useElementBounding: (target: unknown) => {
    measured.target = target;
    return { height: headerHeight };
  },
}));

vi.mock("vue-router", () => ({ useRoute: () => reactive({ path: "/cart" }) }));

vi.mock("@/core/composables", () => ({ useWhiteLabeling: () => ({ logoUrl: ref("/logo.svg") }) }));

vi.mock("../footer/vc-footer.vue", () => ({
  default: defineComponent({ name: "VcFooter", setup: () => () => h("footer", { id: "footer" }) }),
}));

vi.mock("../print/created.vue", () => ({
  default: defineComponent({ name: "Created", setup: () => () => null }),
}));

const RouterLink = defineComponent({
  name: "RouterLink",

  setup(_props, { slots }) {
    return () => h("a", { href: "/" }, slots.default?.());
  },
});

const createWrapper = createWrapperFactory(mount, SecureLayout, {
  global: {
    components: { VcFrame },
    stubs: { VcImage: true, VcIcon: true, "router-link": RouterLink },
    mocks: { $context: { storeName: "Store" } },
  },
  slots: { default: '<p class="page">page</p>' },
});

const appHeaderHeight = () => document.documentElement.style.getPropertyValue("--vc-app-header-height");

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Every focusable element in document order; the skip links are named as part of their block.
const focusOrder = (wrapper: VueWrapper) =>
  wrapper
    .findAll(FOCUSABLE)
    .map((el) =>
      `${el.element.closest(".skip-to-links") ? "skip-to-links" : el.element.tagName.toLowerCase()} ${el.attributes("href") ?? ""}`.trim(),
    );

enableAutoUnmount(afterEach);

describe("SecureLayout", () => {
  afterEach(() => {
    headerHeight.value = 0;
    measured.target = undefined;
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

  it("puts the skip link first in the header, before the logo link", () => {
    const wrapper = createWrapper();

    expect(focusOrder(wrapper)).toEqual(["skip-to-links #main-content", "skip-to-links #footer", "a /"]);
  });

  it("renders the secure checkout badge", () => {
    const wrapper = createWrapper();

    expect(wrapper.find('[data-test-id="checkout-layout.secure-checkout-label"]').exists()).toBe(true);
  });

  it("measures the sticky header element", () => {
    const wrapper = createWrapper();

    expect(toValue(measured.target)).toBe(wrapper.get(".secure-layout__header").element);
  });

  it("publishes its sticky header's height as --vc-app-header-height and keeps it current", async () => {
    createWrapper();

    expect(appHeaderHeight()).toBe("0px");

    headerHeight.value = 56;
    await nextTick();

    expect(appHeaderHeight()).toBe("56px");

    headerHeight.value = 88;
    await nextTick();

    expect(appHeaderHeight()).toBe("88px");
  });
});
