import { mount } from "@vue/test-utils";
import { merge } from "lodash-es";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { computed, defineComponent, nextTick } from "vue";
import { createI18n } from "vue-i18n";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { I18n } from "@/i18n";
import type { ComputedRef } from "vue";

const hoisted = vi.hoisted(() => {
  const globals: { i18n?: unknown } = {};
  const pristinePurchasing = () => ({
    id: "purchasing",
    title: "menu.purchasing",
    children: [
      { id: "orders", title: "menu.orders", priority: 10 },
      { id: "quotes", title: "quotes.navigation.route_name", priority: 20 },
    ],
  });

  return {
    globals,
    menuData: { header: { desktop: { purchasing: pristinePurchasing() } } },
    pristinePurchasing,
  };
});

vi.mock("@/core/globals", () => ({ globals: hoisted.globals }));

vi.mock("@/config/menu.json", () => ({ default: hoisted.menuData }));

vi.mock("@/core/composables/useCurrency", () => ({
  useCurrency: () => ({ currentCurrency: { value: { code: "USD" } } }),
}));

vi.mock("@/core/composables/useThemeContext", () => ({
  useThemeContext: () => ({ themeContext: { value: { catalogId: "test", settings: {} } } }),
}));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({ getSettingValue: () => undefined }),
}));

vi.mock("@/core/api/graphql", () => ({
  getChildCategories: vi.fn(() => Promise.resolve([])),
  getMenu: vi.fn(() => Promise.resolve([])),
}));

vi.mock("@/core/utilities", async () => {
  const menu = await vi.importActual<typeof import("@/core/utilities/menu")>("@/core/utilities/menu");

  return {
    convertToExtendedMenuLink: vi.fn((item) => item),
    getFilterExpressionForCategorySubtree: vi.fn(() => ""),
    getFilterExpressionForInStockVariations: vi.fn(() => ""),
    getFilterExpressionForZeroPrice: vi.fn(() => ""),
    Logger: { error: vi.fn(), warn: vi.fn() },
    categoryToExtendedMenuLink: vi.fn((item) => item),
    getTranslatedMenuLink: menu.getTranslatedMenuLink,
    isActiveRoute: vi.fn(() => false),
  };
});

const MenuLink = defineComponent({
  props: { item: { type: Object, required: true } },
  template: `<span class="link">{{ item.title }}</span>`,
});

/** Hands each link to a child as a prop, like account-navigation.vue — that is where the bug showed. */
function mountSection(section: ComputedRef<ExtendedMenuLinkType | undefined>) {
  return mount(
    defineComponent({
      components: { MenuLink },
      setup: () => ({ links: computed(() => section.value?.children ?? []) }),
      template: `<ul><li v-for="link in links" :key="link.id"><MenuLink :item="link" /></li></ul>`,
    }),
  );
}

async function setup() {
  const i18n = createI18n({ legacy: false, locale: "en", fallbackLocale: "en", messages: { en: {} } });
  hoisted.globals.i18n = i18n;

  const { _useNavigations } = await import("@/core/composables/useNavigations");

  return { i18n: i18n as unknown as I18n, navigations: _useNavigations() };
}

function labels(wrapper: ReturnType<typeof mountSection>) {
  return wrapper.findAll(".link").map((w) => w.text());
}

/** The shape `useLanguages().mergeLocalesMessages` uses; `mergeLocaleMessage` does not trigger Vue. */
function mergeBundle(i18n: I18n, locale: string, messages: Record<string, unknown>) {
  i18n.global.setLocaleMessage(locale, merge({}, i18n.global.getLocaleMessage(locale), messages));
}

describe("useNavigations menu labels vs. late locale bundles", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    hoisted.menuData.header.desktop.purchasing = hoisted.pristinePurchasing();
  });

  it("renders a module label that is merged into i18n after the first render", async () => {
    const { i18n, navigations } = await setup();
    const wrapper = mountSection(navigations.desktopPurchasingMenuItems);

    expect(labels(wrapper)).toContain("quotes.navigation.route_name");

    mergeBundle(i18n, "en", { quotes: { navigation: { route_name: "Quote requests" } } });
    await nextTick();

    expect(labels(wrapper)).toContain("Quote requests");
  });

  it("re-translates labels after a runtime locale switch", async () => {
    const { i18n, navigations } = await setup();
    const wrapper = mountSection(navigations.desktopPurchasingMenuItems);

    mergeBundle(i18n, "en", { quotes: { navigation: { route_name: "Quote requests" } } });
    await nextTick();

    mergeBundle(i18n, "de", { quotes: { navigation: { route_name: "Angebotsanfragen" } } });
    i18n.global.locale.value = "de";
    await nextTick();

    expect(labels(wrapper)).toContain("Angebotsanfragen");
  });

  it("keeps the raw keys in a registered section", async () => {
    const { i18n, navigations } = await setup();
    const child = { id: "hub-dashboard", title: "sales_rep.hub.dashboard.navigation.link" };
    const section = { id: "hub", title: "sales_rep.navigation.link", children: [child] };

    navigations.registerAccountSection(section);
    mergeBundle(i18n, "en", {
      sales_rep: { navigation: { link: "Sales Rep hub" }, hub: { dashboard: { navigation: { link: "Dashboard" } } } },
    });

    const [translated] = navigations.mobileRegisteredAccountSections.value;
    expect([translated.title, translated.children?.[0]?.title]).toEqual(["Sales Rep hub", "Dashboard"]);
    expect([section.title, child.title]).toEqual([
      "sales_rep.navigation.link",
      "sales_rep.hub.dashboard.navigation.link",
    ]);
  });

  it("keeps the raw keys in the shared menu schema", async () => {
    const { i18n, navigations } = await setup();

    mergeBundle(i18n, "en", { quotes: { navigation: { route_name: "Quote requests" } } });

    expect(navigations.desktopPurchasingMenuItems.value?.children?.map((child) => child.title)).toEqual([
      "menu.orders",
      "Quote requests",
    ]);
    expect(hoisted.menuData.header.desktop.purchasing.children.map((child) => child.title)).toEqual([
      "menu.orders",
      "quotes.navigation.route_name",
    ]);
  });
});
