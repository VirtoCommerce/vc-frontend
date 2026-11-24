import { flushPromises, shallowMount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { reactive, ref } from "vue";
import { useSearchScore } from "@/shared/layout/composables/useSearchScore";
import Category from "./category.vue";
import type { VueWrapper } from "@vue/test-utils";

const pendingFetches = vi.hoisted(() => [] as Array<(value: unknown) => void>);

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

vi.mock("vue-router", () => ({
  useRoute: () => reactive({ query: {}, params: {} }),
  useRouter: () => ({
    options: { history: { state: {} } },
    currentRoute: ref({ name: "", query: {} }),
    resolve: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock("@/core/composables", () => ({
  useAnalytics: () => ({ analytics: vi.fn() }),
  useThemeContext: () => ({ themeContext: ref({ settings: {} }) }),
}));
vi.mock("@/core/composables/useLanguages", () => ({ useLanguages: () => ({ updateLocalizedUrl: vi.fn() }) }));
vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({ getSettingValue: () => undefined }),
}));
vi.mock("@/core/globals", () => ({ globals: { catalogId: "catalog", currencyCode: "USD" } }));
vi.mock("@/shared/catalog/composables/useCategorySeo", () => ({ useCategorySeo: vi.fn() }));
vi.mock("@/shared/catalog/composables/useProductSortings", () => ({
  useProductSortings: () => ({ sortList: ref([]), selectedSort: ref() }),
}));
vi.mock("@/shared/layout/composables/useSearchBar.ts", () => ({
  useSearchBar: () => ({ clearSearchResults: vi.fn() }),
}));
vi.mock("@/shared/ship-to-location/composables", () => ({
  LOCAL_ID_PREFIX: "local-",
  useShipToLocation: () => ({ selectedAddress: ref() }),
}));

vi.mock("@/shared/catalog/composables", () => ({
  useCategory: () => ({
    loading: ref(false),
    category: ref(),
    fetchCategory: () => new Promise((resolve) => pendingFetches.push(resolve)),
  }),
  useProducts: () => ({
    facetsQueryParam: ref(""),
    fetchingMoreProducts: ref(false),
    fetchingProducts: ref(false),
    fetchingFacets: ref(false),
    hasSelectedFacets: ref(false),
    hasSelectedFilters: ref(false),
    isFiltersSidebarVisible: ref(false),
    localStorageBranches: ref([]),
    localStorageInStock: ref(false),
    localStoragePurchasedBefore: ref(false),
    pagesCount: ref(1),
    pageHistory: ref([]),
    products: ref([]),
    productsFilters: ref({ facets: [], inStock: false, purchasedBefore: false, branches: [] }),
    searchQueryParam: ref(""),
    sortQueryParam: ref(""),
    sortings: ref([]),
    totalProductsCount: ref(0),
    preserveUserQueryQueryParam: ref(),
    barcodeQueryParam: ref(""),
    isBarcodeLookup: ref(false),
    currentPage: ref(1),

    applyFilters: vi.fn(),
    applyFiltersOnly: vi.fn(),
    fetchProducts: vi.fn(() => Promise.resolve({ items: [], totalCount: 0 })),
    fetchMoreProducts: vi.fn(),
    hideFiltersSidebar: vi.fn(),
    openBranchesModal: vi.fn(),
    resetFacetFilters: vi.fn(),
    resetFacetAndControlsFilters: vi.fn(),
    resetSearchKeyword: vi.fn(),
    showFiltersSidebar: vi.fn(),
    updateCurrentPage: vi.fn(),
    resetCurrentPage: vi.fn(),
  }),
}));

const { preparingScope, prepareScope } = useSearchScore();

let wrapper: VueWrapper | undefined;

function mountCategory(props: { categoryId?: string; isRoot?: boolean }) {
  wrapper = shallowMount(Category, {
    props,
    global: {
      mocks: { $t: (key: string) => key, $n: String },
      // Registered globally by the ui-kit plugin, which no test boots.
      stubs: {
        VcButton: true,
        VcChip: true,
        VcIcon: true,
        VcLabel: true,
        VcLayout: true,
        VcSelect: true,
        VcTypography: true,
        "i18n-t": true,
      },
    },
  });
  return wrapper;
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  pendingFetches.length = 0;
  preparingScope.value = false;
});

describe("Category — search scope preparation", () => {
  it("prepares the scope while its category is fetched, and finishes when the fetch ends", async () => {
    mountCategory({ categoryId: "category-1" });

    expect(preparingScope.value).toBe(true);

    pendingFetches[0](undefined);
    await flushPromises();

    expect(preparingScope.value).toBe(false);
  });

  it("finishes preparing when torn down mid-fetch", () => {
    mountCategory({ categoryId: "category-1" });

    wrapper!.unmount();
    wrapper = undefined;

    expect(preparingScope.value).toBe(false);
  });

  it("leaves the next page's preparation alone when a fetch outlives its page", async () => {
    mountCategory({ categoryId: "category-1" });
    wrapper!.unmount();
    wrapper = undefined;
    const finishNext = prepareScope();

    pendingFetches[0](undefined);
    await flushPromises();

    expect(preparingScope.value).toBe(true);

    finishNext();
  });

  it("prepares the next category when the id changes, ignoring the previous fetch", async () => {
    const category = mountCategory({ categoryId: "category-1" });

    await category.setProps({ categoryId: "category-2" });
    pendingFetches[0](undefined);
    await flushPromises();

    expect(preparingScope.value).toBe(true);

    pendingFetches[1](undefined);
    await flushPromises();

    expect(preparingScope.value).toBe(false);
  });

  it("prepares nothing on the catalog root", () => {
    mountCategory({ isRoot: true });

    expect(preparingScope.value).toBe(false);
  });
});
