import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import MobileSearchBar from "./mobile-search-bar.vue";
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

vi.mock("@/core/composables", () => ({
  useAnalytics: () => ({ analytics: vi.fn() }),
  useRouteQueryParam: () => ref(""),
  useThemeContext: () => ({ themeContext: ref({ settings: {} }) }),
}));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({ getSettingValue: (name: string) => settingValues.get(name) }),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

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

vi.mock("./search-bar/barcode-scanner.vue", () => ({
  default: defineComponent({
    name: "BarcodeScanner",

    setup() {
      return () => h("button", { "data-testid": "barcode-scanner" });
    },
  }),
}));

/** Renders the `append` slot, where the scanner and search buttons live. */
const VcInputStub = defineComponent({
  name: "VcInput",
  inheritAttrs: false,

  setup(_props, { slots }) {
    return () => h("div", { class: "input" }, slots.append?.());
  },
});

const VcButtonStub = defineComponent({
  name: "VcButton",
  inheritAttrs: false,

  setup(_props, { slots, attrs }) {
    return () => h("button", { ...attrs }, slots.default?.());
  },
});

const VcScrollbarStub = defineComponent({
  name: "VcScrollbar",

  setup(_props, { slots }) {
    return () => h("div", slots.default?.());
  },
});

const BARCODE_SCANNER_SELECTOR = '[data-testid="barcode-scanner"]';

let mountedWrapper: VueWrapper | undefined;

function createComponent() {
  mountedWrapper = mount(MobileSearchBar, {
    props: { visible: true },
    global: {
      stubs: {
        VcInput: VcInputStub,
        VcButton: VcButtonStub,
        VcScrollbar: VcScrollbarStub,
      },
      mocks: { $t: mockTranslate },
    },
  });

  return mountedWrapper;
}

beforeEach(() => {
  settingValues.clear();
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
    settingValues.set("Catalog.Search.BarcodeScannerEnabled", false);

    const wrapper = createComponent();

    expect(wrapper.findAll(BARCODE_SCANNER_SELECTOR)).toHaveLength(0);
  });
});
