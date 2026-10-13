import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import SearchDropdown from "./search-dropdown.vue";

const analytics = vi.fn();
const products = ref<{ id: string }[]>([]);
const searchResults = vi.fn(() => {
  products.value = [{ id: "product-1" }];
  return Promise.resolve();
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ currentRoute: ref({ path: "/", query: {} }), push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/core/composables", () => ({
  useAnalytics: () => ({ analytics }),
  useCategoriesRoutes: () => ref({}),
  useRouteQueryParam: () => ref(undefined),
  useThemeContext: () => ({ themeContext: ref({ settings: {} }) }),
}));

vi.mock("@/core/composables/useHistoricalEvents", () => ({
  useHistoricalEvents: () => ({
    saveSearchQuery: vi.fn(),
    useGetSearchHistoryQuery: () => ({ result: ref(undefined), load: vi.fn(), loading: ref(false) }),
  }),
}));

vi.mock("@/shared/layout/composables/useSearchBar", () => ({
  useSearchBar: () => ({
    total: ref(1),
    loading: ref(false),
    pages: ref([]),
    products,
    suggestions: ref([]),
    categories: ref([]),
    searchResults,
    maxSearchLength: ref(400),
  }),
}));

function mountDropdown(visible: boolean) {
  return mount(SearchDropdown, {
    props: { visible, searchPhrase: "tablet" },
    global: { stubs: { VcScrollbar: true, SearchBarProductCard: true, VcButton: true, VcImage: true } },
  });
}

function searchBarImpressions() {
  return analytics.mock.calls.filter(
    ([event, , params]) =>
      event === "viewItemList" && (params as { item_list_id?: string } | undefined)?.item_list_id === "search_bar",
  );
}

describe("SearchDropdown search_bar impression", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    products.value = [];
    analytics.mockClear();
    searchResults.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not push view_item_list when the phrase is set while the dropdown is hidden", async () => {
    mountDropdown(false);

    await vi.advanceTimersByTimeAsync(300);
    await flushPromises();

    expect(searchResults).toHaveBeenCalled();
    expect(searchBarImpressions()).toHaveLength(0);
  });

  it("pushes view_item_list once the dropdown is visible with results", async () => {
    const wrapper = mountDropdown(false);

    await vi.advanceTimersByTimeAsync(300);
    await wrapper.setProps({ visible: true });
    await vi.advanceTimersByTimeAsync(300);
    await flushPromises();

    expect(searchBarImpressions()).toHaveLength(1);
  });
});
