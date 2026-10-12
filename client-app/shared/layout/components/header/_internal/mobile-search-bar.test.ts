import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import MobileSearchBar from "./mobile-search-bar.vue";
import {
  BARCODE_SCANNER_ENABLED_SETTING,
  BARCODE_SCANNER_SELECTOR,
  SEARCH_PHRASE_SELECTOR,
  routeQuery,
  searchBarStubs,
} from "./search-bar/search-bar-test-utils";
import type { VueWrapper } from "@vue/test-utils";

const mockTranslate = (key: string) => key;

const { settingValues } = vi.hoisted(() => ({ settingValues: new Map<string, unknown>() }));

vi.mock("@vueuse/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@vueuse/core")>();
  return {
    ...actual,
    useElementBounding: () => ({ top: ref(0), height: ref(0) }),
    useBreakpoints: () => ({ smaller: () => ref(false) }),
    useLocalStorage: () => ref(true),
  };
});

vi.mock("@/core/globals", () => ({
  globals: { catalogId: "catalog-1", currencyCode: "USD" },
}));

vi.mock("@/core/composables", async () => {
  const { createRouteQueryParamMock } = await import("./search-bar/search-bar-test-utils");
  return {
    ...createRouteQueryParamMock(),
    useAnalytics: () => ({ analytics: vi.fn() }),
    useThemeContext: () => ({ themeContext: ref({ settings: {} }) }),
  };
});

vi.mock("@/core/composables/useModuleSettings", async () => {
  const { createModuleSettingsMock } = await import("./search-bar/search-bar-test-utils");
  return createModuleSettingsMock(settingValues);
});

vi.mock("vue-router", async () => {
  const { createRouterMock } = await import("./search-bar/search-bar-test-utils");
  return createRouterMock();
});

vi.mock("@/shared/layout/composables/useSearchBar", () => ({
  useSearchBar: () => ({
    loading: ref(false),
    maxSearchLength: ref(100),
    hideSearchBar: vi.fn(),
  }),
}));

vi.mock("./search-dropdown.vue", () => ({
  default: defineComponent({
    name: "SearchDropdown",
    props: ["filterExpression", "categoriesFilterExpression", "searchPhrase", "visible"],

    setup() {
      return () => h("div", { "data-testid": "search-dropdown" });
    },
  }),
}));

vi.mock("./search-bar/barcode-scanner.vue", async () => {
  const { createBarcodeScannerMock } = await import("./search-bar/search-bar-test-utils");
  return createBarcodeScannerMock();
});

let mountedWrapper: VueWrapper | undefined;

function createComponent() {
  mountedWrapper = mount(MobileSearchBar, {
    props: { visible: true },
    global: {
      stubs: searchBarStubs,
      mocks: { $t: mockTranslate },
    },
  });

  return mountedWrapper;
}

beforeEach(() => {
  settingValues.clear();
  routeQuery.value = {};
});

afterEach(() => {
  mountedWrapper?.unmount();
  mountedWrapper = undefined;
});

// Mirrors the desktop search bar: both bars must gate the scanner on the same store setting.
describe("MobileSearchBar barcode scanner", () => {
  it("shows the scanner when the store setting is missing", () => {
    const wrapper = createComponent();

    expect(wrapper.findAll(BARCODE_SCANNER_SELECTOR)).toHaveLength(1);
  });

  it("hides the scanner when the store disabled it", () => {
    settingValues.set(BARCODE_SCANNER_ENABLED_SETTING, false);

    const wrapper = createComponent();

    expect(wrapper.findAll(BARCODE_SCANNER_SELECTOR)).toHaveLength(0);
  });
});

// Mirrors the desktop search bar: a barcode lookup ignores `q`, so neither bar may show a leftover one.
describe("MobileSearchBar phrase from the URL", () => {
  it("leaves the box empty and shows the scanner for a barcode lookup with a leftover q", async () => {
    routeQuery.value = { barcode: "150701", q: "hat" };

    const wrapper = createComponent();
    await nextTick();

    expect(wrapper.get(SEARCH_PHRASE_SELECTOR).text()).toBe("");
    expect(wrapper.findAll(BARCODE_SCANNER_SELECTOR)).toHaveLength(1);
  });

  it("fills the box from q when no barcode is set", async () => {
    routeQuery.value = { q: "hat" };

    const wrapper = createComponent();
    await nextTick();

    expect(wrapper.get(SEARCH_PHRASE_SELECTOR).text()).toBe("hat");
    expect(wrapper.findAll(BARCODE_SCANNER_SELECTOR)).toHaveLength(0);
  });
});
