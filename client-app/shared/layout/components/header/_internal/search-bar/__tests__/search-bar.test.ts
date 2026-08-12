import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { useSearchScore } from "@/shared/layout/composables/useSearchScore";
import SearchBar from "../search-bar.vue";
import type { VueWrapper } from "@vue/test-utils";

const mockTranslate = (key: string) => key;

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

vi.mock("@/core/composables", () => ({
  useRouteQueryParam: () => ref(""),
  useThemeContext: () => ({ themeContext: ref({ settings: {} }) }),
}));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({ getSettingValue: () => undefined }),
}));

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

vi.mock("../../search-dropdown.vue", () => ({ default: { name: "SearchDropdown", render: () => null } }));
vi.mock("../barcode-scanner.vue", () => ({ default: { name: "BarcodeScanner", render: () => null } }));

/** Renders only the `prepend` slot — that is where the scope indicators live. */
const VcInputStub = defineComponent({
  name: "VcInput",
  inheritAttrs: false,

  setup(_props, { slots }) {
    return () => h("div", { class: "input" }, slots.prepend?.());
  },
});

const VcButtonStub = defineComponent({
  name: "VcButton",
  inheritAttrs: false,

  setup(_props, { slots, attrs }) {
    return () => h("button", { ...attrs }, slots.default?.());
  },
});

const LOADING_INDICATOR_SELECTOR = '[aria-label="shared.layout.search_bar.scope_loading_label"]';

const { searchScopeData, preparingScope } = useSearchScore();

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
      stubs: {
        VcInput: VcInputStub,
        VcButton: VcButtonStub,
      },
      mocks: { $t: mockTranslate },
    },
  });

  return mountedWrapper;
}

beforeEach(() => {
  searchScopeData.value = { queryScope: "", searchScope: [] };
  preparingScope.value = false;
});

afterEach(() => {
  mountedWrapper?.unmount();
  mountedWrapper = undefined;
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

  it("shows the scope chip once preparation finished", () => {
    setCategoryScope("parent-category", "Parent category");

    const wrapper = createComponent();

    expect(wrapper.findAll(LOADING_INDICATOR_SELECTOR)).toHaveLength(0);

    const chips = wrapper.findAll("[data-search-scope]");
    expect(chips).toHaveLength(1);
    expect(chips[0].text()).toBe("Parent category");
  });
});
