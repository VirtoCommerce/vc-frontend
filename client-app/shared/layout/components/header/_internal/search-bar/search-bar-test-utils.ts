import { computed, defineComponent, h, ref } from "vue";

/**
 * Shared scaffolding for the two search bar specs (desktop `search-bar` and `mobile-search-bar`).
 * Both bars render the same building blocks and read the same store settings, so the stubs and the
 * module mocks live here and each spec only keeps its own `vi.mock` calls (which cannot be moved).
 */

export const BARCODE_SCANNER_SELECTOR = '[data-testid="barcode-scanner"]';
export const BARCODE_SCANNER_ENABLED_SETTING = "Catalog.Search.BarcodeScannerEnabled";
export const SEARCH_PHRASE_SELECTOR = '[data-testid="search-phrase"]';

/** The bars read every store setting through this composable; the map is the spec's control over it. */
export function createModuleSettingsMock(settingValues: Map<string, unknown>) {
  return {
    useModuleSettings: () => ({ getSettingValue: (name: string) => settingValues.get(name) }),
  };
}

/** The URL query the bars read; a spec sets it before mounting, or after it as a navigation would. */
export const routeQuery = ref<Record<string, string>>({});

/** A param missing from `routeQuery` reads as "", as it does through the real `useRouteQueryParam`. */
export function createRouteQueryParamMock() {
  return {
    useRouteQueryParam: (key: string) => computed(() => routeQuery.value[key] ?? ""),
  };
}

/** Neither spec navigates; the bars only need a router to exist. */
export function createRouterMock() {
  return {
    useRouter: () => ({ push: () => undefined }),
  };
}

/** The real scanner opens a camera; the stub is only there to be found (or not) in the rendered bar. */
export function createBarcodeScannerMock() {
  return {
    default: defineComponent({
      name: "BarcodeScanner",

      setup() {
        return () => h("button", { "data-testid": "barcode-scanner" });
      },
    }),
  };
}

/**
 * Renders the `placeholder` attr, the bound phrase and the `prepend` / `append` slots — where the scope
 * indicators, the search button and the barcode scanner live.
 */
const VcInputStub = defineComponent({
  name: "VcInput",
  inheritAttrs: false,

  setup(_props, { slots, attrs }) {
    return () =>
      h("div", { class: "input" }, [
        h("span", { "data-testid": "placeholder" }, attrs.placeholder as string),
        h("span", { "data-testid": "search-phrase" }, attrs.modelValue as string),
        slots.prepend?.(),
        slots.append?.(),
      ]);
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

export const searchBarStubs = {
  VcInput: VcInputStub,
  VcButton: VcButtonStub,
  VcScrollbar: VcScrollbarStub,
};
