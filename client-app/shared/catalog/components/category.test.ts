import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, defineComponent, h, shallowRef } from "vue";
import { createMemoryHistory, createRouter, createWebHistory } from "vue-router";
import { useBarcodeSearch } from "@/shared/layout/composables/useBarcodeSearch";
import Category from "./category.vue";
import type { Product } from "@/core/api/graphql/types";
import type { ProductsSearchParamsType } from "@/shared/catalog";
import type { VueWrapper } from "@vue/test-utils";
import type { Router, RouterHistory } from "vue-router";

type ProductsRequestType = { params: Partial<ProductsSearchParamsType>; page: number | undefined };

const mocks = vi.hoisted(() => ({
  analytics: vi.fn(),
  paginationMode: "infinite_scroll",
  // What the next products request resolves with.
  response: { items: [] as Product[], totalCount: 0 },
  // The next request never settles (a rejection cannot stand in: the page's watcher lets it escape unhandled).
  stallNextRequest: false,
  // The requests of the page mounted last (a page left by an earlier test may still have a debounced one due).
  requests: [] as ProductsRequestType[],
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/core/globals", () => ({
  globals: { catalogId: "catalog-1", currencyCode: "USD" },
}));

vi.mock("@/core/composables", async () => {
  const { ref } = await import("vue");
  const { useRouteQueryParam } = await import("@/core/composables/useRouteQueryParam");

  return {
    useAnalytics: () => ({ analytics: mocks.analytics }),
    useRouteQueryParam,
    useThemeContext: () => ({ themeContext: ref({ settings: { catalog_pagination_mode: mocks.paginationMode } }) }),
  };
});

vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ updateLocalizedUrl: vi.fn() }),
}));

// The fields setting makes a scan an exact lookup (see `scan`).
vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({
    getSettingValue: (name: string) => (name === "Catalog.Search.BarcodeSearchFields" ? '["gtin"]' : undefined),
  }),
}));

vi.mock("@/shared/layout/composables/useSearchBar", () => ({
  useSearchBar: () => ({ clearSearchResults: vi.fn() }),
}));

vi.mock("@/shared/layout/composables/useSearchScore", async () => {
  const { ref } = await import("vue");

  return {
    useSearchScore: () => ({
      isCategoryScope: ref(false),
      preparingScope: ref(false),
      addScopeItem: vi.fn(),
      removeScopeItemByType: vi.fn(),
      setQueryScope: vi.fn(),
    }),
  };
});

vi.mock("@/shared/ship-to-location/composables", async () => {
  const { ref } = await import("vue");

  return {
    LOCAL_ID_PREFIX: "local-",
    useShipToLocation: () => ({ selectedAddress: ref(undefined) }),
  };
});

vi.mock("@/shared/catalog/composables/useCategorySeo", () => ({
  useCategorySeo: vi.fn(),
}));

vi.mock("@/shared/catalog/composables/useProductSortings", async () => {
  const { ref } = await import("vue");

  return {
    useProductSortings: () => ({ sortList: ref([]), selectedSort: ref("") }),
  };
});

// Mirrors the parts of the real composable the page relies on: the route params are the real ones, load more
// starts from the URL's page and asks for the current page, and a request resolves with the response it applied.
vi.mock("@/shared/catalog/composables", async () => {
  const { computed, ref } = await import("vue");
  const { useRouteQueryParam } = await import("@/core/composables/useRouteQueryParam");
  const { toFirstString } = await import("@/core/utilities/common");

  return {
    useCategory: () => ({ loading: ref(false), category: ref(undefined), fetchCategory: vi.fn() }),
    useProducts: (options: { catalogPaginationMode?: string }) => {
      const isLoadMore = options.catalogPaginationMode === "load_more";
      const pageQueryParam = useRouteQueryParam<string>("page", { defaultValue: "" });
      const products = ref<Product[]>([]);
      const totalProductsCount = ref(0);
      const currentPage = ref(isLoadMore && pageQueryParam.value ? Number(pageQueryParam.value) : 1);
      const pageHistory = ref<number[]>([]);
      const productsFilters = ref({
        facets: [],
        filters: [],
        inStock: true,
        branches: ["branch-1"],
        purchasedBefore: true,
      });
      const searchQueryParam = useRouteQueryParam<string>("q", { defaultValue: "" });
      const rawBarcodeQueryParam = useRouteQueryParam<string>("barcode", { defaultValue: "" });
      const barcodeQueryParam = computed(() => toFirstString(rawBarcodeQueryParam.value));
      const requests: ProductsRequestType[] = [];

      mocks.requests = requests;

      return {
        facetsQueryParam: useRouteQueryParam<string>("facets", { defaultValue: "" }),
        searchQueryParam,
        sortQueryParam: useRouteQueryParam<string>("sort", { defaultValue: "" }),
        preserveUserQueryQueryParam: useRouteQueryParam<string>("preserveUserQuery", { defaultValue: "" }),
        barcodeQueryParam,
        isBarcodeLookup: computed(() => !!barcodeQueryParam.value),
        fetchingMoreProducts: ref(false),
        fetchingProducts: ref(false),
        fetchingFacets: ref(false),
        hasSelectedFacets: ref(false),
        hasSelectedFilters: computed(() => productsFilters.value.filters.length > 0),
        isFiltersSidebarVisible: ref(false),
        localStorageBranches: ref(["branch-1"]),
        localStorageInStock: ref(true),
        localStoragePurchasedBefore: ref(true),
        pagesCount: ref(5),
        pageHistory,
        products,
        productsFilters,
        sortings: ref([]),
        totalProductsCount,
        currentPage,

        fetchProducts: vi.fn((params: Partial<ProductsSearchParamsType>) => {
          const page = isLoadMore && params.page === undefined ? currentPage.value : params.page;

          requests.push({ params, page });

          if (mocks.stallNextRequest) {
            mocks.stallNextRequest = false;

            return new Promise<never>(() => undefined);
          }

          const { items, totalCount } = mocks.response;

          products.value = items;
          totalProductsCount.value = totalCount;

          if (!pageHistory.value.includes(page ?? 1)) {
            pageHistory.value.push(page ?? 1);
          }

          return Promise.resolve({ items, totalCount });
        }),
        fetchMoreProducts: vi.fn(),
        applyFilters: vi.fn(),
        applyFiltersOnly: vi.fn(),
        hideFiltersSidebar: vi.fn(),
        openBranchesModal: vi.fn(),
        resetFacetFilters: vi.fn(),
        resetFacetAndControlsFilters: vi.fn(() => Promise.resolve()),
        resetSearchKeyword: () => {
          searchQueryParam.value = "";
        },
        showFiltersSidebar: vi.fn(),
        updateCurrentPage: (page: number) => {
          currentPage.value = page;
        },
        resetCurrentPage: () => {
          currentPage.value = 1;

          if (isLoadMore) {
            pageHistory.value = [1];
          }

          return Promise.resolve();
        },
      };
    },
  };
});

function stubComponent(name: string, testId: string) {
  return {
    default: defineComponent({
      name,

      setup() {
        return () => h("div", { "data-testid": testId });
      },
    }),
  };
}

vi.mock("@/shared/catalog/components/category-selector.vue", () => stubComponent("CategorySelector", "selector"));
vi.mock("@/shared/catalog/components/products-filters.vue", () => stubComponent("ProductsFilters", "sidebar-filters"));
vi.mock("@/shared/catalog/components/view-mode.vue", () => stubComponent("ViewMode", "view-mode"));
vi.mock("@/shared/catalog/components/category/category-controls.vue", () =>
  stubComponent("CategoryControls", "category-controls"),
);
vi.mock("@/shared/catalog/components/category/category-horizontal-filters.vue", () =>
  stubComponent("CategoryHorizontalFilters", "horizontal-filters"),
);
vi.mock("@/shared/catalog/components/category/filters-popup-sidebar.vue", () =>
  stubComponent("FiltersPopupSidebar", "popup-filters"),
);

vi.mock("@/shared/catalog/components/active-filter-chips.vue", () => ({
  default: defineComponent({
    name: "ActiveFilterChips",

    setup(_props, { slots }) {
      return () => h("div", { "data-testid": "filter-chips" }, slots.actions?.());
    },
  }),
}));

vi.mock("@/shared/catalog/components/category/category-products.vue", () => ({
  default: defineComponent({
    name: "CategoryProducts",
    props: ["pageNumber", "pageHistory"],
    emits: { resetFilterKeyword: () => true },

    setup(props, { emit }) {
      return () =>
        h("button", {
          "data-testid": "category-products",
          "data-page-number": props.pageNumber,
          "data-page-history": JSON.stringify(props.pageHistory),
          onClick: () => emit("resetFilterKeyword"),
        });
    },
  }),
}));

const SlotStub = defineComponent({
  setup(_props, { slots }) {
    return () => h("div", slots.default?.());
  },
});

const VcLayoutStub = defineComponent({
  name: "VcLayout",

  setup(_props, { slots }) {
    return () => h("div", [slots.sidebar?.(), slots.default?.()]);
  },
});

const VcButtonStub = defineComponent({
  name: "VcButton",
  inheritAttrs: false,

  setup(_props, { attrs, slots }) {
    return () => h("button", { class: attrs.class }, slots.default?.());
  },
});

const I18nTStub = defineComponent({
  name: "I18nT",

  setup(_props, { slots }) {
    return () => h("span", [slots.barcode?.(), slots.keyword?.()]);
  },
});

const PRODUCT = { id: "product-1", code: "150701", slug: "hat-150701", name: "Hat" } as Product;
const OTHER_PRODUCT = { id: "product-2", code: "150701-B", slug: "cap-150701", name: "Cap" } as Product;

let router: Router;
let wrapper: VueWrapper | undefined;

// The memory history keeps no `back` entry, i.e. every page is a direct landing.
function createTestRouter(history: RouterHistory = createMemoryHistory()) {
  const page = defineComponent({ setup: () => () => null });

  return createRouter({
    history,
    routes: [
      { path: "/search", name: "Search", component: page },
      { path: "/catalog", name: "Catalog", component: page },
      { path: "/:slug(.*)", name: "Product", component: page },
    ],
  });
}

async function mountAt(url: string, props: Record<string, unknown> = {}) {
  await router.push(url);
  await router.isReady();

  wrapper = mount(Category, {
    props,
    global: {
      plugins: [router],
      mocks: { $t: (key: string) => key, $n: String },
      components: { "i18n-t": I18nTStub },
      stubs: {
        VcLayout: VcLayoutStub,
        VcTypography: SlotStub,
        VcButton: VcButtonStub,
        VcChip: SlotStub,
        VcSelect: true,
        VcLabel: true,
        VcIcon: true,
      },
    },
  });

  await waitForRequests(1);

  return wrapper;
}

async function waitForRequests(count: number) {
  await vi.waitFor(() => expect(mocks.requests.length).toBeGreaterThanOrEqual(count));
  await flushPromises();
}

function lastRequest(): ProductsRequestType {
  return mocks.requests[mocks.requests.length - 1];
}

// What the search bars do on a scan.
async function scan(code: string) {
  const app = createApp({ setup: () => () => null }).use(router);

  app.runWithContext(() => {
    const { onBarcodeScanned } = useBarcodeSearch({
      searchPhrase: shallowRef(""),
      searchDropdownRef: shallowRef(null),
      hideSearchResults: () => undefined,
    });

    onBarcodeScanned(code);
  });

  await flushPromises();
}

function searchEvents(): unknown[][] {
  return mocks.analytics.mock.calls.filter(([event]) => event === "search");
}

function reportedEvents(): unknown[] {
  return mocks.analytics.mock.calls.map(([event]) => event as unknown);
}

// The page is mounted outside a RouterView, so a real navigation away would leave it mounted and refetching.
function stubLeavingThePage() {
  return vi.spyOn(router, "replace").mockResolvedValue(undefined);
}

function exists(selector: string): boolean {
  return wrapper!.find(selector).exists();
}

beforeAll(() => {
  // jsdom has no layout, so the page's scroll-to-results has nothing to call.
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  router = createTestRouter();
  mocks.analytics.mockClear();
  mocks.paginationMode = "infinite_scroll";
  mocks.response = { items: [PRODUCT, OTHER_PRODUCT], totalCount: 2 };
  mocks.stallNextRequest = false;
  mocks.requests = [];
});

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe("category page in a barcode lookup", () => {
  describe("single hit", () => {
    it("opens the product page when the code matched exactly one product", async () => {
      mocks.response = { items: [PRODUCT], totalCount: 1 };
      const replace = stubLeavingThePage();

      await mountAt("/search?barcode=150701");

      expect(replace).toHaveBeenCalledOnce();
      expect(replace).toHaveBeenCalledWith("/hat-150701");
    });

    it("stays on the list when the code matched several products", async () => {
      const replace = vi.spyOn(router, "replace");

      await mountAt("/search?barcode=150701");

      expect(replace).not.toHaveBeenCalled();
      expect(router.currentRoute.value.fullPath).toBe("/search?barcode=150701");
    });
  });

  describe("request", () => {
    // Control: outside a lookup the same URL and preferences do reach the filter.
    it("sends the facets and the in-stock, purchased-before and branch preferences in a normal search", async () => {
      await mountAt("/search?q=hat&facets=color:red");

      const { filter } = lastRequest().params;

      expect(filter).toContain("color:red");
      expect(filter).toContain("branch-1");
    });

    it("sends only the barcode term, whatever facets and preferences are set", async () => {
      await mountAt("/search?barcode=150701&facets=color:red");

      expect(lastRequest().params.filter).toBe('barcode:"150701"');
    });

    it("sends no keyword, so `q` can neither narrow nor empty the lookup", async () => {
      await mountAt("/search?barcode=150701&q=hat");

      expect(lastRequest().params.keyword).toBe("");
      expect(lastRequest().params.filter).toBe('barcode:"150701"');
    });

    it("sends the keyword in a normal search", async () => {
      await mountAt("/search?q=hat");

      expect(lastRequest().params.keyword).toBe("hat");
    });

    // A repeated param reaches the page as an array, which the filter escaping cannot take.
    it("looks up the first code when the param is repeated", async () => {
      await mountAt("/search?barcode=150701&barcode=150702");

      expect(lastRequest().params.filter).toBe('barcode:"150701"');
    });
  });

  describe("controls", () => {
    // Control: the same state (in-stock, purchased-before and a branch are on) shows every filter control.
    it("shows the facet sidebar, the preference controls and the filter chips in a normal search", async () => {
      await mountAt("/search?q=hat");

      expect(exists('[data-testid="sidebar-filters"]')).toBe(true);
      expect(exists('[data-testid="category-controls"]')).toBe(true);
      expect(exists('[data-testid="filter-chips"]')).toBe(true);
      expect(wrapper!.text()).toContain("common.buttons.reset_filters");
    });

    it("hides the facet sidebar, the preference controls, the filter chips and Reset filters", async () => {
      await mountAt("/search?barcode=150701");

      expect(exists('[data-testid="sidebar-filters"]')).toBe(false);
      expect(exists('[data-testid="category-controls"]')).toBe(false);
      expect(exists('[data-testid="filter-chips"]')).toBe(false);
      expect(exists(".category__facets-button")).toBe(false);
      expect(wrapper!.text()).not.toContain("common.buttons.reset_filters");
    });

    it("keeps sorting and the view mode switch", async () => {
      await mountAt("/search?barcode=150701");

      expect(exists(".category__sort")).toBe(true);
      expect(exists('[data-testid="view-mode"]')).toBe(true);
    });

    // The horizontal filter bar carries the sorting in that layout, so the plain select stands in for it.
    it("replaces the horizontal filter bar with the plain sort select", async () => {
      await mountAt("/search?barcode=150701", { filtersOrientation: "horizontal" });

      expect(exists('[data-testid="horizontal-filters"]')).toBe(false);
      expect(exists('[data-testid="popup-filters"]')).toBe(false);
      expect(exists(".category__sort")).toBe(true);
    });
  });

  describe("paging", () => {
    // Load more keeps the page it reached, and a new scan's URL carries no page.
    it("starts a second scan from the first page in load-more mode", async () => {
      mocks.paginationMode = "load_more";

      await mountAt("/search?barcode=150701&page=3");

      expect(lastRequest().page).toBe(3);

      await router.push("/search?barcode=150702");
      await waitForRequests(2);

      expect(lastRequest()).toEqual({ params: expect.objectContaining({ filter: 'barcode:"150702"' }), page: 1 });

      const products = wrapper!.get('[data-testid="category-products"]');

      expect(products.attributes("data-page-number")).toBe("1");
      expect(products.attributes("data-page-history")).toBe("[1]");
    });
  });

  describe("reset", () => {
    function resetSearch() {
      return wrapper!.get('[data-testid="category-products"]').trigger("click");
    }

    // A direct landing has no previous route to return to, so clearing the params is all Reset does.
    it("clears both the barcode and `q`", async () => {
      await mountAt("/search?barcode=150701&q=hat");

      await resetSearch();
      await flushPromises();

      expect(router.currentRoute.value.fullPath).toBe("/search");
    });

    // The page counts a lookup as a search term, so Reset leaves the search results as it does for `q`.
    it("returns to the catalog after a lookup", async () => {
      router = createTestRouter(createWebHistory());

      await router.push("/catalog");
      await mountAt("/search?barcode=150701");

      await resetSearch();
      await flushPromises();

      expect(router.currentRoute.value.name).toBe("Catalog");
      expect(router.currentRoute.value.query).toEqual({});
    });
  });

  // The owed report is module state, so each test scans a code of its own.
  describe("analytics", () => {
    beforeEach(async () => {
      await router.push("/catalog");
    });

    it("reports the scan's search event with what the lookup found", async () => {
      await scan("4001");
      await mountAt("/search?barcode=4001");

      expect(searchEvents()).toEqual([["search", "4001", [PRODUCT, OTHER_PRODUCT], 2]]);
    });

    // A link, reload or back navigation to the results is not a new search.
    it("reports no search event when no scan is owed one", async () => {
      await mountAt("/search?barcode=4002");

      expect(searchEvents()).toEqual([]);
    });

    // A re-scan of the code on screen does not navigate, so nothing is fetched for it.
    it("reports nothing for a re-scan of the code on screen, then or on a later request", async () => {
      await scan("4003");
      await mountAt("/search?barcode=4003");
      await scan("4003");
      await router.push("/search?barcode=4003&sort=price");
      await waitForRequests(2);

      expect(searchEvents()).toEqual([["search", "4003", [PRODUCT, OTHER_PRODUCT], 2]]);
    });

    it("reports no late search event after the lookup's own request failed to deliver", async () => {
      await scan("4004");
      mocks.stallNextRequest = true;
      await mountAt("/search?barcode=4004");
      await router.push("/search?barcode=4004&sort=price");
      await waitForRequests(2);

      expect(searchEvents()).toEqual([]);
    });

    it("reports the viewed results under the scanned code", async () => {
      await mountAt("/search?barcode=4005&q=hat");

      expect(mocks.analytics).toHaveBeenCalledWith("viewSearchResults", "4005", {
        visible_items: [{ code: "150701" }, { code: "150701-B" }],
        results_count: 2,
        results_page: 1,
      });
    });

    // The list is never seen, but the search happened and found one product.
    it("reports the search but not the list when a single hit opens the product", async () => {
      mocks.response = { items: [PRODUCT], totalCount: 1 };
      await scan("4006");
      const replace = stubLeavingThePage();

      await mountAt("/search?barcode=4006");

      expect(replace).toHaveBeenCalledWith("/hat-150701");
      expect(searchEvents()).toEqual([["search", "4006", [PRODUCT], 1]]);
      expect(reportedEvents()).not.toContain("viewSearchResults");
      expect(reportedEvents()).not.toContain("viewItemList");
    });
  });
});
