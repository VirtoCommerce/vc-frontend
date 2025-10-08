import { useLocalStorage } from "@vueuse/core";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import { computed, readonly, ref } from "vue";
import { searchProducts } from "@/core/api/graphql/catalog";
import { useRouteQueryParam, useThemeContext } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import {
  FFC_LOCAL_STORAGE,
  IN_STOCK_PRODUCTS_LOCAL_STORAGE,
  PAGE_LIMIT,
  PRODUCT_SORTING_LIST,
  PURCHASED_BEFORE_LOCAL_STORAGE,
  EXCLUDED_FILTER_NAMES,
  zeroPriceFilter,
} from "@/core/constants";
import { INTENT_SEARCH_MODULE_ID, INTENT_SEARCH_ENABLED_KEY } from "@/core/constants/modules";
import { QueryParamName, SortDirection } from "@/core/enums";
import {
  generateFilterExpressionFromFilters,
  Logger,
  rangeFacetToCommonFacet,
  termFacetToCommonFacet,
} from "@/core/utilities";
import { usePurchasedBefore } from "@/shared/catalog/composables/usePurchasedBefore";
import { CATALOG_PAGINATION_MODES } from "@/shared/catalog/constants/catalog";
import { useModal } from "@/shared/modal";
import type {
  CatalogPaginationModeType,
  FiltersDisplayOrderType,
  ProductsFiltersType,
  ProductsSearchParamsType,
} from "../types";
import type { Product, RangeFacet, TermFacet, SearchProductFilterResult } from "@/core/api/graphql/types";
import type { FacetItemType } from "@/core/types";
import type { Ref } from "vue";
import BranchesModal from "@/shared/fulfillmentCenters/components/branches-modal.vue";

const DEFAULT_ITEMS_PER_PAGE = 16;

export function useProducts(
  options: {
    /** @default false */
    withFacets?: boolean;
    /** @default config.image_carousel_in_product_card_enabled */
    withImages?: boolean;
    /** @default config.zero_price_product_enabled */
    withZeroPrice?: boolean;
    filtersDisplayOrder?: Ref<FiltersDisplayOrderType | undefined>;
    useQueryParams?: boolean;
    /** @default CATALOG_PAGINATION_MODES.infiniteScroll */
    catalogPaginationMode?: CatalogPaginationModeType;
    facetsToHide?: string[];
  } = {},
) {
  const { themeContext } = useThemeContext();
  const {
    withFacets = false,
    withImages = themeContext.value?.settings?.image_carousel_in_product_card_enabled,
    withZeroPrice = themeContext.value?.settings?.zero_price_product_enabled,
    catalogPaginationMode = CATALOG_PAGINATION_MODES.infiniteScroll,
  } = options;
  const { openModal } = useModal();
  const { isEnabled } = useModuleSettings(INTENT_SEARCH_MODULE_ID);
  const isIntentSearchEnabled = isEnabled(INTENT_SEARCH_ENABLED_KEY);

  const { isPurchasedBeforeEnabled } = usePurchasedBefore();

  const localStorageInStock = useLocalStorage<boolean>(IN_STOCK_PRODUCTS_LOCAL_STORAGE, true);
  const localStorageBranches = useLocalStorage<string[]>(FFC_LOCAL_STORAGE, []);
  const _localStoragePurchasedBefore = useLocalStorage<boolean>(PURCHASED_BEFORE_LOCAL_STORAGE, false);
  const localStoragePurchasedBefore = computed({
    get: () => isPurchasedBeforeEnabled.value && _localStoragePurchasedBefore.value,
    set: (value) => {
      _localStoragePurchasedBefore.value = value;
    },
  });

  const pageQueryParam = useRouteQueryParam<string>(QueryParamName.Page, {
    defaultValue: "1",
    removeDefaultValue: true,
    validator: (value) => {
      return String(Number(value)) === value && Number(value) > 0 && Number.isInteger(Number(value));
    },
  });

  const sortQueryParam = useRouteQueryParam<string>(QueryParamName.Sort, {
    defaultValue: PRODUCT_SORTING_LIST[0].id,
    validator: (value) => PRODUCT_SORTING_LIST.some((item) => item.id === value),
  });

  const searchQueryParam = useRouteQueryParam<string>(QueryParamName.SearchPhrase, {
    defaultValue: "",
  });

  const preserveUserQueryQueryParam = useRouteQueryParam<string>(QueryParamName.PreserveUserQuery, {
    defaultValue: "",
  });

  /** @deprecated use `searchQueryParam` instead */
  const keywordQueryParam = useRouteQueryParam<string>(QueryParamName.Keyword, {
    defaultValue: "",
  });

  const facetsQueryParam = useRouteQueryParam<string>(QueryParamName.Facets, {
    defaultValue: "",
  });

  const fetchingProducts = ref(true);
  const fetchingMoreProducts = ref(false);
  const fetchingFacets = ref(false);
  const totalProductsCount = ref(0);
  const pagesCount = ref(1);
  const isFiltersSidebarVisible = ref(false);
  const currentPage = ref(
    catalogPaginationMode === CATALOG_PAGINATION_MODES.loadMore && pageQueryParam.value
      ? Number(pageQueryParam.value)
      : 1,
  );
  const pageHistory = ref<number[]>([]);

  const products = ref<Product[]>([]);
  const facets = ref<FacetItemType[]>([]);

  const prevProductsFilters = ref<ProductsFiltersType>();
  const productsFilters = ref<ProductsFiltersType>({
    branches: localStorageBranches.value,
    inStock: localStorageInStock.value,
    purchasedBefore: localStoragePurchasedBefore.value,
    facets: [],
    filters: [],
  });
  const normalizedFacetsToHide = computed(() => options.facetsToHide?.map((facet) => facet.toLowerCase()));
  const productFiltersSorted = computed(() => {
    return { ...productsFilters.value, facets: getSortedFacets(productsFilters.value.facets) };
  });

  const productsById = computed(() =>
    products.value.reduce(
      (result, product, index) => {
        result[product.id] = { index, product };
        return result;
      },
      {} as Record<string, { index: number; product: Product }>,
    ),
  );

  function getSortedFacets(allFacets: FacetItemType[]): FacetItemType[] {
    if (options.filtersDisplayOrder?.value?.order?.length) {
      const order = options.filtersDisplayOrder.value.order
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);

      if (!order.length) {
        return allFacets;
      }

      const sortedFacets: FacetItemType[] = [];

      order.forEach((filter) => {
        const facet = allFacets.find(({ label }) => label.toLowerCase() === filter);
        if (facet) {
          sortedFacets.push(facet);
        }
      });

      return options.filtersDisplayOrder?.value?.showRest
        ? [...sortedFacets, ...allFacets.filter(({ label }) => !order.includes(label.toLowerCase()))]
        : sortedFacets;
    }

    return allFacets;
  }

  function showFiltersSidebar(): void {
    prevProductsFilters.value = cloneDeep(productsFilters.value);
    isFiltersSidebarVisible.value = true;
  }

  function hideFiltersSidebar(): void {
    isFiltersSidebarVisible.value = false;
  }

  async function applyFilters(newFilters: ProductsFiltersType): Promise<void> {
    // Generate filter expression from filters only
    const filterExpression: string = generateFilterExpressionFromFilters(newFilters.filters);

    if (options?.useQueryParams && facetsQueryParam.value !== filterExpression) {
      facetsQueryParam.value = filterExpression;
    }

    if (localStorageInStock.value !== newFilters.inStock) {
      localStorageInStock.value = newFilters.inStock;
    }

    if (!isEqual(localStorageBranches.value, newFilters.branches)) {
      localStorageBranches.value = newFilters.branches;
    }

    if (localStoragePurchasedBefore.value !== newFilters.purchasedBefore) {
      localStoragePurchasedBefore.value = newFilters.purchasedBefore;
    }

    await preserveUserQuery();

    void resetCurrentPage();
  }

  async function applyFiltersOnly(newFilters: SearchProductFilterResult[]): Promise<void> {
    // Update only the filters part of productsFilters
    productsFilters.value = {
      ...productsFilters.value,
      filters: newFilters,
    };

    // Generate filter expression from filters only and update query param
    const filterExpression: string = generateFilterExpressionFromFilters(newFilters);

    if (options?.useQueryParams && facetsQueryParam.value !== filterExpression) {
      facetsQueryParam.value = filterExpression;
    }

    await preserveUserQuery();

    void resetCurrentPage();
  }

  function applyFacetsOnly(newFacets: FacetItemType[]): void {
    // Update only the facets part of productsFilters
    productsFilters.value = {
      ...productsFilters.value,
      facets: newFacets,
    };

    // Generate filter expression from filters only and update query param
    const filterExpression: string = generateFilterExpressionFromFilters(productsFilters.value.filters);

    if (options?.useQueryParams && facetsQueryParam.value !== filterExpression) {
      facetsQueryParam.value = filterExpression;
    }

    void resetCurrentPage();
  }

  async function resetFacetFilters() {
    facetsQueryParam.value = "";
    await preserveUserQuery();

    productsFilters.value.filters = [];

    void resetCurrentPage();
  }

  async function preserveUserQuery() {
    if (!isIntentSearchEnabled) {
      preserveUserQueryQueryParam.value = "";
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 0));
    // needs to wait for the router to update the query params, because of race condition on setting query params with useRouteQueryParam composable
    preserveUserQueryQueryParam.value = "yes";
  }

  /** @deprecated use `searchQueryParam` instead */
  function resetFilterKeyword(): void {
    keywordQueryParam.value = "";
  }

  function updateProductsFilters(newFilters: ProductsFiltersType): void {
    productsFilters.value = {
      ...newFilters,
      facets: getSortedFacets(newFilters.facets),
      filters: prepareFilters(newFilters.filters),
    };
  }

  function openBranchesModal(fromPopupSidebarFilter: boolean) {
    openModal({
      component: BranchesModal,
      props: {
        selectedBranches: fromPopupSidebarFilter ? productsFilters.value.branches : localStorageBranches.value,
        onSave(branches: string[]) {
          if (fromPopupSidebarFilter) {
            const newFilters: ProductsFiltersType = {
              branches,
              facets: productsFilters.value.facets,
              inStock: productsFilters.value.inStock,
              purchasedBefore: productsFilters.value.purchasedBefore,
              filters: productsFilters.value.filters,
            };

            updateProductsFilters(newFilters);
          } else {
            localStorageBranches.value = branches;
          }
          void resetCurrentPage();
        },
      },
    });
  }

  function hasSelectedFacets(): boolean {
    const filteredFacets = facets.value.filter(
      (facet) => !normalizedFacetsToHide.value?.includes(facet.paramName.toLowerCase()),
    );
    const filteredFilters = productsFilters.value.filters.filter(
      (filter) => !normalizedFacetsToHide.value?.includes(filter.name.toLowerCase()),
    );
    return !!filteredFacets.length && !!filteredFilters.length;
  }

  function setFacets({ termFacets = [], rangeFacets = [] }: { termFacets?: TermFacet[]; rangeFacets?: RangeFacet[] }) {
    if (themeContext.value?.settings?.product_filters_sorting) {
      const ascDirection = themeContext.value?.settings?.product_filters_sorting_direction === SortDirection.Ascending;

      termFacets.sort((a, b) => (ascDirection ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label)));
      rangeFacets.sort((a, b) => (ascDirection ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label)));
    }

    facets.value = Array<FacetItemType>().concat(
      rangeFacets.map(rangeFacetToCommonFacet),
      termFacets.map(termFacetToCommonFacet),
    );
  }

  async function fetchProducts(_searchParams: Partial<ProductsSearchParamsType>, withZeroPriceMain?: boolean) {
    const searchParams = {
      ..._searchParams,
      page:
        catalogPaginationMode === CATALOG_PAGINATION_MODES.loadMore && _searchParams.page === undefined
          ? currentPage.value
          : _searchParams.page,
    };

    fetchingProducts.value = true;
    products.value = [];
    totalProductsCount.value = 0;
    pagesCount.value = 1;

    if (searchParams.page) {
      updateCurrentPage(Number(searchParams.page));
    }

    const actualWithZeroPrice = withZeroPriceMain ?? withZeroPrice;

    try {
      const {
        items = [],
        term_facets = [],
        range_facets = [],
        totalCount = 0,
        filters = [],
      } = await searchProducts(searchParams, { withFacets, withImages, withZeroPrice: actualWithZeroPrice });

      products.value = items;
      totalProductsCount.value = totalCount;
      pagesCount.value = Math.min(
        Math.ceil(totalProductsCount.value / (searchParams.itemsPerPage || DEFAULT_ITEMS_PER_PAGE)),
        PAGE_LIMIT,
      );

      addPageHistory(searchParams.page ?? 1);

      if (withFacets) {
        setFacets({
          termFacets: term_facets,
          rangeFacets: range_facets,
        });

        productsFilters.value = {
          inStock: localStorageInStock.value,
          purchasedBefore: localStoragePurchasedBefore.value,
          branches: localStorageBranches.value.slice(),
          facets: getSortedFacets(facets.value),
          filters: prepareFilters(filters),
        };
      }
    } catch (e) {
      Logger.error(`useProducts.${fetchProducts.name}`, e);
      throw e;
    } finally {
      fetchingProducts.value = false;
    }
  }

  async function fetchMoreProducts(searchParams: Partial<ProductsSearchParamsType>) {
    fetchingMoreProducts.value = true;

    try {
      const { items = [], totalCount = 0 } = await searchProducts(searchParams, { withImages, withZeroPrice });

      const page = searchParams.page;
      const minVisitedPage = Math.min(...pageHistory.value);

      if (
        catalogPaginationMode === CATALOG_PAGINATION_MODES.loadMore &&
        page &&
        minVisitedPage &&
        page < minVisitedPage
      ) {
        // if load previous page, we need to add new items to the beginning of the array
        products.value = [...items, ...products.value];
      } else {
        // if load next page, we need to add new items to the end of the array
        products.value = products.value.concat(items);
      }

      totalProductsCount.value = totalCount;
      pagesCount.value = Math.min(
        Math.ceil(totalProductsCount.value / (searchParams.itemsPerPage || DEFAULT_ITEMS_PER_PAGE)),
        PAGE_LIMIT,
      );

      addPageHistory(page);
    } catch (e) {
      Logger.error(`useProducts.${fetchMoreProducts.name}`, e);
      throw e;
    } finally {
      fetchingMoreProducts.value = false;
    }
  }

  function addPageHistory(page?: number) {
    if (page && page <= pagesCount.value && !pageHistory.value.includes(page)) {
      pageHistory.value.push(page);
    }
  }

  async function getFacets(searchParams: Partial<ProductsSearchParamsType>): Promise<FacetItemType[]> {
    fetchingFacets.value = true;

    try {
      const _searchParams = { ...searchParams, page: 0, itemsPerPage: 0 };
      const { term_facets = [], range_facets = [] } = await searchProducts(_searchParams, {
        withZeroPrice,
        withFacets: true,
      });

      term_facets.sort((a, b) => a.label.localeCompare(b.label));
      range_facets.sort((a, b) => a.label.localeCompare(b.label));

      return Array<FacetItemType>().concat(
        term_facets.map(termFacetToCommonFacet),
        range_facets.map(rangeFacetToCommonFacet),
      );
    } catch (e) {
      Logger.error(`useProducts.${getFacets.name}`, e);
      throw e;
    } finally {
      fetchingFacets.value = false;
    }
  }

  function updateCurrentPage(page: number) {
    currentPage.value = page;

    if (catalogPaginationMode === CATALOG_PAGINATION_MODES.loadMore && page > Math.max(...pageHistory.value)) {
      pageQueryParam.value = page.toString();
    }
  }

  function isZeroPriceFilter(value: SearchProductFilterResult): boolean {
    if (value.rangeValues?.length === 1) {
      const range = value.rangeValues[0];
      return (
        range.lower === zeroPriceFilter.lower &&
        !range.upper &&
        range.includeLowerBound === zeroPriceFilter.includeLowerBound &&
        range.includeUpperBound === zeroPriceFilter.includeUpperBound
      );
    }
    return false;
  }

  function isExcludedFilter(filter: SearchProductFilterResult): boolean {
    return EXCLUDED_FILTER_NAMES.includes(filter.name);
  }

  function prepareFilters(filters: SearchProductFilterResult[]) {
    return filters.filter((filter) => !isZeroPriceFilter(filter) && !isExcludedFilter(filter));
  }

  async function resetCurrentPage() {
    updateCurrentPage(1);
    if (catalogPaginationMode === CATALOG_PAGINATION_MODES.loadMore) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      // needs to wait for the router to update the query params, because of race condition on setting query params with useRouteQueryParam composable
      pageQueryParam.value = "";
      pageHistory.value = [1];
    }
  }

  return {
    facets,
    facetsQueryParam,
    fetchingFacets: readonly(fetchingFacets),
    fetchingMoreProducts: readonly(fetchingMoreProducts),
    fetchingProducts: readonly(fetchingProducts),
    hasSelectedFacets: computed(() => hasSelectedFacets()),
    isFiltersDirty: computed(() => !isEqual(prevProductsFilters.value, productsFilters.value)),
    isFiltersSidebarVisible: readonly(isFiltersSidebarVisible),
    /** @deprecated use `searchQueryParam` instead */
    keywordQueryParam,
    localStorageBranches,
    localStorageInStock,
    localStoragePurchasedBefore,
    pagesCount: readonly(pagesCount),
    products: computed(() => products.value),
    productsById,
    productsFilters: productFiltersSorted,
    searchQueryParam,
    sortQueryParam,
    preserveUserQueryQueryParam,
    totalProductsCount: readonly(totalProductsCount),

    currentPage: readonly(currentPage),
    pageHistory: readonly(pageHistory),
    resetCurrentPage,
    updateCurrentPage,

    applyFilters,
    applyFiltersOnly,
    applyFacetsOnly,
    getFacets,
    fetchMoreProducts,
    fetchProducts,
    hideFiltersSidebar,
    openBranchesModal,
    resetFacetFilters,
    /** @deprecated use `searchQueryParam` instead */
    resetFilterKeyword,
    showFiltersSidebar,
    updateProductsFilters,
  };
}
