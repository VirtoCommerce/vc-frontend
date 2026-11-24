import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, nextTick, ref } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import BottomHeader from "./bottom-header.vue";
import type { ExtendedMenuLinkType } from "@/core/types";
import ExtensionPoint from "@/shared/common/components/extension-point.vue";
import LinkDefault from "@/shared/layout/components/header/_internal/link-components/link-default.vue";

type EntryType = { use?: () => Record<string, unknown> };

type HoistedType = {
  entries: Record<string, Record<string, EntryType>>;
  menuItems: { value: ExtendedMenuLinkType[] };
  iconsMenuLinks: { value: ExtendedMenuLinkType[] | undefined };
  canBrowseCatalog: { value: boolean };
};

const h = vi.hoisted((): HoistedType => ({
  entries: {},
  menuItems: { value: [] },
  iconsMenuLinks: { value: undefined },
  canBrowseCatalog: { value: true },
}));

const BUILT_IN_CART: ExtendedMenuLinkType = {
  id: "cart",
  route: { name: "Cart" },
  title: "Cart",
  icon: "cart-2",
  dataTestId: "desktop-main-menu-cart-link",
};

const MY_LIST: ExtendedMenuLinkType = { id: "my-list", title: "My list", route: { name: "MyList" } };

vi.mock("@/shared/common/composables/extensionRegistry/useExtensionRegistry", () => ({
  useExtensionRegistry: () => ({
    getComponent: () => null,
    getContribution: (category: string, name: string) => h.entries[category]?.[name]?.use,
    getProps: () => undefined,
    isRegistered: () => false,
    passesCondition: () => true,
  }),
}));

vi.mock("@/core/composables", () => ({
  useNavigations: () => ({ catalogMenuItems: ref([]), desktopMainMenuItems: h.menuItems }),
}));
vi.mock("@/shared/account/composables/useUser", () => ({
  useUser: () => ({ organization: ref(), canBrowseCatalog: computed(() => h.canBrowseCatalog.value) }),
}));
vi.mock("@/shared/layout/composables/useHeaderLogo", () => ({ useHeaderLogo: () => ({ headerLogoUrl: ref("") }) }));
vi.mock("@/shared/layout/composables/useThemeChrome", () => ({
  useThemeChrome: () => ({ logoWidth: ref(), logoStyle: ref(), iconsMenuLinks: h.iconsMenuLinks, siteHeader: ref() }),
}));
vi.mock("@/shared/static-content/sections", () => ({ getPreviewSectionAttrs: () => ({}) }));

vi.mock("./search-bar/search-bar.vue", () => ({ default: { name: "SearchBar", render: () => null } }));
vi.mock("./catalog-menu.vue", () => ({ default: { name: "CatalogMenu", render: () => null } }));

// A link with a count names itself through useI18n (useHeaderCountLabel), which needs no installed plugin here.
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: { title: string; count: string }) => (params ? `${params.title}: ${params.count}` : key),
    n: (value: number) => String(value),
  }),
}));

const VcBadgeStub = { name: "VcBadge", template: "<span><slot /></span>" };

function mountHeader() {
  const page = { render: () => null };
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: page },
      { path: "/catalog", name: "Catalog", component: page },
      { path: "/my-list", name: "MyList", component: page },
      { path: "/cart", name: "Cart", component: page },
      { path: "/:pathMatch(.*)*", component: page },
    ],
  });

  return mount(BottomHeader, {
    global: {
      plugins: [router],
      components: { ExtensionPoint },
      stubs: { VcBadge: VcBadgeStub, VcIcon: true, VcImage: true },
      mocks: {
        $t: (key: string) => key,
        $n: (value: number) => String(value),
        $context: { settings: {}, storeName: "Store" },
      },
    },
  });
}

describe("BottomHeader", () => {
  beforeEach(() => {
    h.menuItems.value = [MY_LIST];
    h.iconsMenuLinks.value = undefined;
  });

  it("shows the count a headerMenu entry contributes as a badge on the host's link", () => {
    h.entries = { headerMenu: { "my-list": { use: () => ({ count: 4 }) } } };

    const wrapper = mountHeader();

    expect(wrapper.getComponent(VcBadgeStub).text()).toBe("4");
    // The badge is hidden from assistive technology, so the count also goes into the link's name.
    expect(wrapper.get('a[aria-label="My list: 4"]').text()).toContain("My list");
  });

  it("repaints the badge when the contributed count changes", async () => {
    const count = ref(0);
    h.entries = { headerMenu: { "my-list": { use: () => ({ count: computed(() => count.value) }) } } };

    const wrapper = mountHeader();
    expect(wrapper.findComponent(VcBadgeStub).exists()).toBe(false);

    count.value = 2;
    await nextTick();

    expect(wrapper.getComponent(VcBadgeStub).text()).toBe("2");
  });

  it("draws the link without a badge when nothing is contributed", () => {
    h.entries = {};

    const wrapper = mountHeader();

    expect(wrapper.text()).toContain("My list");
    expect(wrapper.findComponent(VcBadgeStub).exists()).toBe(false);
  });
});

describe("BottomHeader icons menu", () => {
  beforeEach(() => {
    h.entries = {};
    h.menuItems.value = [BUILT_IN_CART];
    h.iconsMenuLinks.value = undefined;
  });

  function shownItems(): ExtendedMenuLinkType[] {
    return mountHeader()
      .findAllComponents(LinkDefault)
      .map((link) => link.props("item") as ExtendedMenuLinkType);
  }

  it("shows the built-in links without a theme menu", () => {
    expect(shownItems()).toEqual([BUILT_IN_CART]);
  });

  it("shows the theme link's title on a link to a built-in page, with that page's icon and count", () => {
    h.iconsMenuLinks.value = [{ title: "Basket", route: "/cart" }];

    expect(shownItems()).toEqual([{ ...BUILT_IN_CART, title: "Basket" }]);
  });

  it("shows a theme link to another page as the theme has it", () => {
    h.iconsMenuLinks.value = [{ title: "Help", route: "/help" }];

    expect(shownItems()).toEqual([{ id: "/help", title: "Help", route: "/help" }]);
  });
});

describe("BottomHeader search", () => {
  beforeEach(() => {
    h.menuItems.value = [];
    h.canBrowseCatalog.value = true;
  });

  it("shows the search bar to a customer who can browse the catalog", () => {
    expect(mountHeader().findComponent({ name: "SearchBar" }).exists()).toBe(true);
  });

  it("hides the search bar from a customer awaiting approval", () => {
    h.canBrowseCatalog.value = false;

    expect(mountHeader().findComponent({ name: "SearchBar" }).exists()).toBe(false);
  });
});
