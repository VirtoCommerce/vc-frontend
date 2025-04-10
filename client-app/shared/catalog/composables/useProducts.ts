import { useLocalStorage } from "@vueuse/core";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import { computed, readonly, ref, shallowRef, triggerRef } from "vue";
import { searchProducts } from "@/core/api/graphql/catalog";
import { useRouteQueryParam, useThemeContext } from "@/core/composables";
import { FFC_LOCAL_STORAGE, IN_STOCK_PRODUCTS_LOCAL_STORAGE, PAGE_LIMIT, PRODUCT_SORTING_LIST } from "@/core/constants";
import { QueryParamName, SortDirection } from "@/core/enums";
import {
  getFilterExpressionFromFacets,
  Logger,
  rangeFacetToCommonFacet,
  termFacetToCommonFacet,
} from "@/core/utilities";
import { CATALOG_MODES } from "@/shared/catalog/constants/catalog";
import { useModal } from "@/shared/modal";
import type { CatalogModeType, FiltersDisplayOrderType, ProductsFiltersType, ProductsSearchParamsType } from "../types";
import type { Product, RangeFacet, TermFacet } from "@/core/api/graphql/types";
import type { FacetItemType, FacetValueItemType } from "@/core/types";
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
    /** @default CATALOG_MODES.infiniteScroll */
    catalogMode?: CatalogModeType;
  } = {},
) {
  const { themeContext } = useThemeContext();
  const {
    withFacets = false,
    withImages = themeContext.value?.settings?.image_carousel_in_product_card_enabled,
    withZeroPrice = themeContext.value?.settings?.zero_price_product_enabled,
    catalogMode = CATALOG_MODES.infiniteScroll,
  } = options;
  const { openModal } = useModal();

  const localStorageInStock = useLocalStorage<boolean>(IN_STOCK_PRODUCTS_LOCAL_STORAGE, true);
  const localStorageBranches = useLocalStorage<string[]>(FFC_LOCAL_STORAGE, []);

  const pageQueryParam = useRouteQueryParam<string>(QueryParamName.Page, {
    defaultValue: "1",
    removeDefaultValue: true,
  });

  const sortQueryParam = useRouteQueryParam<string>(QueryParamName.Sort, {
    defaultValue: PRODUCT_SORTING_LIST[0].id,
    validator: (value) => PRODUCT_SORTING_LIST.some((item) => item.id === value),
  });

  const searchQueryParam = useRouteQueryParam<string>(QueryParamName.SearchPhrase, {
    defaultValue: "",
  });

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
    catalogMode === CATALOG_MODES.loadMoreButtons && pageQueryParam.value ? (Number(pageQueryParam.value) ?? 1) : 1,
  );
  const pageHistory = ref<number[]>([]);

  const products = ref<Product[]>([]);
  const facets = shallowRef<FacetItemType[]>([]);

  const prevProductsFilters = shallowRef<ProductsFiltersType>();
  const productsFilters = shallowRef<ProductsFiltersType>({
    branches: localStorageBranches.value,
    inStock: localStorageInStock.value,
    facets: [],
  });
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

  function applyFilters(newFilters: ProductsFiltersType): void {
    const facetsFilterExpression: string = getFilterExpressionFromFacets(newFilters.facets);

    if (options?.useQueryParams && facetsQueryParam.value !== facetsFilterExpression) {
      facetsQueryParam.value = facetsFilterExpression;
    }

    if (localStorageInStock.value !== newFilters.inStock) {
      localStorageInStock.value = newFilters.inStock;
    }

    if (!isEqual(localStorageBranches.value, newFilters.branches)) {
      localStorageBranches.value = newFilters.branches;
    }

    void resetCurrentPage();
  }

  async function removeFacetFilter(payload: Pick<FacetItemType, "paramName"> & Pick<FacetValueItemType, "value">) {
    const facet = productsFilters.value.facets.find((item) => item.paramName === payload.paramName);
    const facetValue = facet?.values.find((item) => item.value === payload.value);

    if (facetValue) {
      facetValue.selected = false;
      facetsQueryParam.value = options?.useQueryParams ? getFilterExpressionFromFacets(facets) : "";
      await new Promise((resolve) => setTimeout(resolve, 0));
      // needs to wait for the router to update the query params, because of race condition on setting query params with useRouteQueryParam composable

      triggerRef(facets);
      void resetCurrentPage();
    }
  }

  async function resetFacetFilters() {
    facetsQueryParam.value = "";
    await new Promise((resolve) => setTimeout(resolve, 0));
    // needs to wait for the router to update the query params, because of race condition on setting query params with useRouteQueryParam composable

    productsFilters.value.facets.forEach((filter) =>
      filter.values.forEach((filterItem) => (filterItem.selected = false)),
    );

    triggerRef(facets);
    void resetCurrentPage();
  }

  function resetFilterKeyword(): void {
    keywordQueryParam.value = "";

    triggerRef(facets);
  }

  function updateProductsFilters(newFilters: ProductsFiltersType): void {
    productsFilters.value = {
      ...newFilters,
      facets: getSortedFacets(newFilters.facets),
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
    return facets.value?.some((facet) => facet.values.some((value) => value.selected));
  }

  function setFacets({ termFacets = [], rangeFacets = [] }: { termFacets?: TermFacet[]; rangeFacets?: RangeFacet[] }) {
    if (themeContext.value?.settings?.product_filters_sorting) {
      const ascDirection = themeContext.value?.settings?.product_filters_sorting_direction === SortDirection.Ascending;

      termFacets.sort((a, b) => (ascDirection ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label)));
      rangeFacets.sort((a, b) => (ascDirection ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label)));
    }

    facets.value = Array<FacetItemType>().concat(
      termFacets.map(termFacetToCommonFacet),
      rangeFacets.map(rangeFacetToCommonFacet),
    );
  }

  async function fetchProducts(_searchParams: Partial<ProductsSearchParamsType>) {
    const searchParams = {
      ..._searchParams,
      page:
        catalogMode === CATALOG_MODES.loadMoreButtons && _searchParams.page === undefined
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

    try {
      const {
        items = [],
        term_facets = [],
        range_facets = [],
        totalCount = 0,
      } = await searchProducts(searchParams, { withFacets, withImages, withZeroPrice });

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
          branches: localStorageBranches.value.slice(),
          facets: getSortedFacets(facets.value),
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

      if (catalogMode === CATALOG_MODES.loadMoreButtons && page && minVisitedPage && page < minVisitedPage) {
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

    if (catalogMode === CATALOG_MODES.loadMoreButtons && page > Math.max(...pageHistory.value)) {
      pageQueryParam.value = page.toString();
    }
  }

  async function resetCurrentPage() {
    updateCurrentPage(1);
    if (catalogMode === CATALOG_MODES.loadMoreButtons) {
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
    keywordQueryParam,
    localStorageBranches,
    localStorageInStock,
    pagesCount: readonly(pagesCount),
    products: computed(() => products.value),
    productsById,
    productsFilters: productFiltersSorted,
    searchQueryParam,
    sortQueryParam,
    totalProductsCount: readonly(totalProductsCount),

    currentPage: readonly(currentPage),
    pageHistory: readonly(pageHistory),
    resetCurrentPage,
    updateCurrentPage,

    applyFilters,
    getFacets,
    fetchMoreProducts,
    fetchProducts,
    hideFiltersSidebar,
    openBranchesModal,
    removeFacetFilter,
    resetFacetFilters,
    resetFilterKeyword,
    showFiltersSidebar,
    updateProductsFilters,
  };
}
