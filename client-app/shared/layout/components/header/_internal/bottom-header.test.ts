import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import BottomHeader from "./bottom-header.vue";
import type { ExtendedMenuLinkType } from "@/core/types";
import LinkDefault from "@/shared/layout/components/header/_internal/link-components/link-default.vue";

const h = vi.hoisted(() => ({
  iconsMenuLinks: { value: undefined as ExtendedMenuLinkType[] | undefined },
}));

const BUILT_IN_CART: ExtendedMenuLinkType = {
  id: "cart",
  route: { name: "Cart" },
  title: "Cart",
  icon: "cart-2",
  dataTestId: "desktop-main-menu-cart-link",
};

vi.mock("@/core/composables", () => ({
  useNavigations: () => ({ catalogMenuItems: ref([]), desktopMainMenuItems: ref([BUILT_IN_CART]) }),
}));
vi.mock("@/shared/account/composables/useUser", () => ({ useUser: () => ({ organization: ref() }) }));
vi.mock("@/shared/layout/composables/useHeaderLogo", () => ({ useHeaderLogo: () => ({ headerLogoUrl: ref("") }) }));
vi.mock("@/shared/layout/composables/useThemeChrome", () => ({
  useThemeChrome: () => ({ logoWidth: ref(), logoStyle: ref(), iconsMenuLinks: h.iconsMenuLinks, siteHeader: ref() }),
}));
vi.mock("@/shared/static-content/sections", () => ({ getPreviewSectionAttrs: () => ({}) }));
vi.mock("@/shared/layout/composables/useHeaderCountLabel", () => ({
  useHeaderCountLabel: () => ({ getCountAriaLabel: (title?: string) => title }),
}));
vi.mock("@/shared/layout/components/header-badge/header-badge.vue", () => ({ default: { template: "<span />" } }));
vi.mock("./catalog-menu.vue", () => ({ default: { template: "<div />" } }));
vi.mock("./search-bar/search-bar.vue", () => ({ default: { template: "<div />" } }));

function mountBottomHeader() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/cart", name: "Cart", component: { template: "<div />" } },
      { path: "/catalog", name: "Catalog", component: { template: "<div />" } },
      { path: "/:pathMatch(.*)*", component: { template: "<div />" } },
    ],
  });

  return mount(BottomHeader, {
    global: {
      plugins: [router],
      mocks: { $t: (key: string) => key, $context: { settings: {}, storeName: "Store" } },
      stubs: {
        VcImage: true,
        VcIcon: true,
        ExtensionPoint: { inheritAttrs: false, props: ["category", "name"], template: "<slot />" },
      },
    },
  });
}

function shownItems(): ExtendedMenuLinkType[] {
  return mountBottomHeader()
    .findAllComponents(LinkDefault)
    .map((link) => link.props("item") as ExtendedMenuLinkType);
}

describe("BottomHeader icons menu", () => {
  beforeEach(() => {
    h.iconsMenuLinks.value = undefined;
  });

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
