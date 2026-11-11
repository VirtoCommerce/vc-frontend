import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import MobileHeader from "./mobile-header.vue";

const { headerBottom, headerHeight, Empty } = await vi.hoisted(async () => {
  const vue = await import("vue");
  return {
    headerBottom: vue.ref(0),
    headerHeight: vue.ref(0),
    Empty: (name: string) => ({ default: vue.defineComponent({ name, setup: () => () => null }) }),
  };
});

vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useElementBounding: () => ({ bottom: headerBottom }),
  useElementSize: () => ({ height: headerHeight }),
}));

vi.mock("@/core/composables", () => ({ useWhiteLabeling: () => ({ logoUrl: ref("/logo.svg") }) }));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({ getSettingValue: () => undefined }),
}));

vi.mock("@/shared/cart", () => ({ useShortCart: () => ({ cart: ref() }) }));

vi.mock("@/shared/layout", () => ({ useNestedMobileHeader: () => ({ customSlots: {}, isAnimated: ref(false) }) }));

vi.mock("@/shared/layout/composables/useHeaderCountLabel", () => ({
  useHeaderCountLabel: () => ({ getCountLabel: (label: string) => label }),
}));

vi.mock("@/shared/layout/composables/useSearchBar", () => ({
  useSearchBar: () => ({ searchBarVisible: ref(false), toggleSearchBar: vi.fn() }),
}));

vi.mock("@/shared/ship-to-location", () => ({ ShipToSelector: Empty("ShipToSelector").default }));
vi.mock("./mobile-menu/mobile-menu.vue", () => Empty("MobileMenu"));
vi.mock("./mobile-search-bar.vue", () => Empty("MobileSearchBar"));
vi.mock("@/shared/layout/components/header-badge/header-badge.vue", () => Empty("HeaderBadge"));

const createWrapper = () =>
  mount(MobileHeader, {
    global: {
      stubs: { VcIcon: true, VcImage: true, ExtensionPointList: true, "router-link": true },
      mocks: { $t: (key: string) => key, $context: { settings: {}, storeName: "Store" } },
    },
  });

const appHeaderHeight = () => document.documentElement.style.getPropertyValue("--vc-app-header-height");

enableAutoUnmount(afterEach);

describe("MobileHeader", () => {
  afterEach(() => {
    headerBottom.value = 0;
    headerHeight.value = 0;
    document.documentElement.style.removeProperty("--vc-app-header-height");
  });

  it("publishes the fixed header's bottom edge, the frame's space above it included, as --vc-app-header-height", async () => {
    createWrapper();

    headerHeight.value = 90;
    headerBottom.value = 103;
    await nextTick();

    expect(appHeaderHeight()).toBe("103px");
  });

  it("keeps the in-flow placeholder at the header's own height", async () => {
    const wrapper = createWrapper();

    headerHeight.value = 90;
    headerBottom.value = 103;
    await nextTick();

    expect((wrapper.get("header + div").element as HTMLElement).style.height).toBe("90px");
  });
});
