import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { useSearchScore } from "@/shared/layout/composables/useSearchScore";
import {
  BARCODE_SCANNER_ENABLED_SETTING,
  BARCODE_SCANNER_SELECTOR,
  SEARCH_PHRASE_SELECTOR,
  routeQuery,
  searchBarStubs,
} from "./search-bar-test-utils";
import SearchBar from "./search-bar.vue";
import type { VueWrapper } from "@vue/test-utils";

const mockTranslate = (key: string, params?: Record<string, unknown>) =>
  params ? `${key}:${JSON.stringify(params)}` : key;

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: mockTranslate }),
}));

vi.mock("@vueuse/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@vueuse/core")>();
  return {
    ...actual,
    onClickOutside: vi.fn(),
    useElementBounding: () => ({ bottom: ref(0) }),
    useLocalStorage: () => ref(true),
  };
});

vi.mock("@/core/globals", () => ({
  globals: { catalogId: "catalog-1", currencyCode: "USD" },
}));

vi.mock("@/core/composables", async () => {
  const { createRouteQueryParamMock } = await import("./search-bar-test-utils");
  return {
    ...createRouteQueryParamMock(),
    useAnalytics: () => ({ analytics: vi.fn() }),
    useThemeContext: () => ({ themeContext: ref({ settings: {} }) }),
  };
});

const { settingValues } = vi.hoisted(() => ({ settingValues: new Map<string, unknown>() }));

vi.mock("@/core/composables/useModuleSettings", async () => {
  const { createModuleSettingsMock } = await import("./search-bar-test-utils");
  return createModuleSettingsMock(settingValues);
});

vi.mock("vue-router", async () => {
  const { createRouterMock } = await import("./search-bar-test-utils");
  return createRouterMock();
});

vi.mock("@/shared/layout/composables/useSearchBar", () => ({
  useSearchBar: () => ({
    searchDropdownVisible: ref(false),
    loading: ref(false),
    maxSearchLength: ref(100),
    hideSearchDropdown: vi.fn(),
    showSearchDropdown: vi.fn(),
    clearSearchResults: vi.fn(),
  }),
}));

vi.mock("../search-dropdown.vue", () => ({
  default: defineComponent({
    name: "SearchDropdown",
    props: ["filterExpression", "categoriesFilterExpression", "isCategoryScope", "searchPhrase", "visible"],

    setup(props) {
      return () =>
        h("div", {
          "data-testid": "search-dropdown",
          "data-filter-expression": props.filterExpression ?? "",
          "data-is-category-scope": String(props.isCategoryScope),
        });
    },
  }),
}));
vi.mock("./barcode-scanner.vue", async () => {
  const { createBarcodeScannerMock } = await import("./search-bar-test-utils");
  return createBarcodeScannerMock();
});

const LOADING_INDICATOR_SELECTOR = '[aria-label="shared.layout.search_bar.scope_loading_label"]';
const PLACEHOLDER_SELECTOR = '[data-testid="placeholder"]';
const DROPDOWN_SELECTOR = '[data-testid="search-dropdown"]';

const { searchScopeData, preparingScope, holdScope } = useSearchScore();

let scopeReleases: (() => void)[] = [];

function holdTestScope() {
  const release = holdScope();
  scopeReleases.push(release);
  return release;
}

function setCategoryScope(id: string, label: string) {
  searchScopeData.value = {
    queryScope: "",
    searchScope: [{ id, label, filter: `category.id:${id}`, type: "category" }],
  };
}

let mountedWrapper: VueWrapper | undefined;

function createComponent() {
  mountedWrapper = mount(SearchBar, {
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
  searchScopeData.value = { queryScope: "", searchScope: [] };
  preparingScope.value = false;
});

afterEach(() => {
  mountedWrapper?.unmount();
  mountedWrapper = undefined;
  scopeReleases.forEach((release) => release());
  scopeReleases = [];
});

describe("SearchBar scope indicators", () => {
  // While a category is being prepared the previous category's chip must not stay on screen next
  // to the loading indicator — only one scope indicator may be visible at a time.
  it("hides the scope chips while the category scope is being prepared", () => {
    setCategoryScope("child-category", "Child category");
    preparingScope.value = true;

    const wrapper = createComponent();

    expect(wrapper.findAll(LOADING_INDICATOR_SELECTOR)).toHaveLength(1);
    expect(wrapper.findAll("[data-search-scope]")).toHaveLength(0);
  });

  it("hides the scope chips as soon as preparation starts", async () => {
    setCategoryScope("child-category", "Child category");

    const wrapper = createComponent();

    expect(wrapper.findAll("[data-search-scope]")).toHaveLength(1);

    preparingScope.value = true;
    await nextTick();

    expect(wrapper.findAll(LOADING_INDICATOR_SELECTOR)).toHaveLength(1);
    expect(wrapper.findAll("[data-search-scope]")).toHaveLength(0);
  });

  it("shows the scope chip once preparation finished", async () => {
    setCategoryScope("parent-category", "Parent category");
    preparingScope.value = true;

    const wrapper = createComponent();

    expect(wrapper.findAll(LOADING_INDICATOR_SELECTOR)).toHaveLength(1);
    expect(wrapper.findAll("[data-search-scope]")).toHaveLength(0);

    preparingScope.value = false;
    await nextTick();

    expect(wrapper.findAll(LOADING_INDICATOR_SELECTOR)).toHaveLength(0);

    const chips = wrapper.findAll("[data-search-scope]");
    expect(chips).toHaveLength(1);
    expect(chips[0].text()).toBe("Parent category");
  });
});

describe("SearchBar scope slot geometry", () => {
  // The loading indicator replaces the chip in place: it must keep the chip's content, invisible
  // under the loader, or the input after it moves while the next scope is prepared.
  it("keeps the replaced chip's label inside the loading indicator while the scope is held", async () => {
    setCategoryScope("child-category", "Child category");

    const wrapper = createComponent();

    holdTestScope();
    searchScopeData.value = { queryScope: "", searchScope: [] };
    await nextTick();

    const indicators = wrapper.findAll(LOADING_INDICATOR_SELECTOR);
    expect(indicators).toHaveLength(1);
    expect(indicators[0].text()).toBe("Child category");
  });

  it("forgets the replaced label once the scope is released with nothing in it", async () => {
    setCategoryScope("child-category", "Child category");

    const wrapper = createComponent();

    const release = holdTestScope();
    searchScopeData.value = { queryScope: "", searchScope: [] };
    await nextTick();

    release();
    await nextTick();

    expect(wrapper.findAll(LOADING_INDICATOR_SELECTOR)).toHaveLength(0);

    preparingScope.value = true;
    await nextTick();

    const indicators = wrapper.findAll(LOADING_INDICATOR_SELECTOR);
    expect(indicators).toHaveLength(1);
    expect(indicators[0].text()).toBe("");
  });

  it("shows the loading indicator for as long as any hold is active", async () => {
    const wrapper = createComponent();

    const first = holdTestScope();
    const second = holdTestScope();
    await nextTick();

    first();
    first();
    await nextTick();

    expect(wrapper.findAll(LOADING_INDICATOR_SELECTOR)).toHaveLength(1);

    second();
    await nextTick();

    expect(wrapper.findAll(LOADING_INDICATOR_SELECTOR)).toHaveLength(0);
  });

  it("gives the chip and the loading indicator the same minimum width", async () => {
    setCategoryScope("child-category", "Child category");

    const wrapper = createComponent();
    const chipMinWidth = wrapper.get("[data-search-scope]").attributes("min-width");

    preparingScope.value = true;
    await nextTick();

    expect(chipMinWidth).toBeTruthy();
    expect(wrapper.get(LOADING_INDICATOR_SELECTOR).attributes("min-width")).toBe(chipMinWidth);
  });
});

describe("SearchBar barcode scanner", () => {
  // The store setting is public but optional: a backend that does not know it yet must keep the
  // scanner, so only an explicit `false` hides the button.
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

// A barcode lookup ignores `q` (the results page does not send it), so the box must not show a leftover one:
// it would hide the scanner, and Enter would search the ignored keyword instead of the code.
describe("SearchBar phrase from the URL", () => {
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

  it("leaves the box empty when a navigation opens a barcode lookup with a leftover q", async () => {
    const wrapper = createComponent();

    routeQuery.value = { barcode: "150701", q: "hat" };
    await nextTick();

    expect(wrapper.get(SEARCH_PHRASE_SELECTOR).text()).toBe("");
    expect(wrapper.findAll(BARCODE_SCANNER_SELECTOR)).toHaveLength(1);
  });

  it("fills the box from the q a navigation brings when no barcode is set", async () => {
    const wrapper = createComponent();

    routeQuery.value = { q: "hat" };
    await nextTick();

    expect(wrapper.get(SEARCH_PHRASE_SELECTOR).text()).toBe("hat");
    expect(wrapper.findAll(BARCODE_SCANNER_SELECTOR)).toHaveLength(0);
  });
});

describe("SearchBar scope placeholder and filter expression", () => {
  // The chip is not the only place the stale category surfaces — the input placeholder and the
  // dropdown's filter expression both read the same scope state and must be gated the same way.
  it("falls back to the generic placeholder while the category scope is being prepared", () => {
    setCategoryScope("child-category", "Child category");
    preparingScope.value = true;

    const wrapper = createComponent();

    expect(wrapper.get(PLACEHOLDER_SELECTOR).text()).toBe("shared.layout.search_bar.enter_keyword_placeholder");
  });

  it("shows the category placeholder once the scope is no longer being prepared", () => {
    setCategoryScope("parent-category", "Parent category");
    preparingScope.value = false;

    const wrapper = createComponent();

    expect(wrapper.get(PLACEHOLDER_SELECTOR).text()).toContain(
      "shared.layout.search_bar.enter_keyword_placeholder_category",
    );
    expect(wrapper.get(PLACEHOLDER_SELECTOR).text()).toContain("Parent category");
  });

  it("keeps the dropdown scoped to the category filter while preparing the next category", () => {
    setCategoryScope("child-category", "Child category");
    preparingScope.value = true;

    const wrapper = createComponent();

    expect(wrapper.get(DROPDOWN_SELECTOR).attributes("data-is-category-scope")).toBe("true");
    expect(wrapper.get(DROPDOWN_SELECTOR).attributes("data-filter-expression")).toContain("category.id:child-category");
  });
});
