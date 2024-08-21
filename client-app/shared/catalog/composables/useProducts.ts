import { useLocalStorage } from "@vueuse/core";
import { cloneDeep, isEqual } from "lodash";
import { computed, inject, readonly, ref, shallowRef, triggerRef } from "vue";
import { searchProducts } from "@/core/api/graphql/catalog";
import { useRouteQueryParam } from "@/core/composables";
import { FFC_LOCAL_STORAGE, IN_STOCK_PRODUCTS_LOCAL_STORAGE, PAGE_LIMIT, PRODUCT_SORTING_LIST } from "@/core/constants";
import { QueryParamName, SortDirection } from "@/core/enums";
import { configInjectionKey } from "@/core/injection-keys";
import {
  getFilterExpressionFromFacets,
  Logger,
  rangeFacetToCommonFacet,
  termFacetToCommonFacet,
} from "@/core/utilities";
import { productsInWishlistEvent, useBroadcast } from "@/shared/broadcast";
import { useModal } from "@/shared/modal";
import type { FiltersDisplayOrderType, ProductsFiltersType, ProductsSearchParamsType } from "../types";
import type { Product, RangeFacet, TermFacet } from "@/core/api/graphql/types";
import type { FacetItemType, FacetValueItemType } from "@/core/types";
import type { ProductInWishlistEventDataType } from "@/shared/broadcast";
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
  } = {},
) {
  const config = inject(configInjectionKey, {});
  const {
    withFacets = false,
    withImages = config.image_carousel_in_product_card_enabled,
    withZeroPrice = config.zero_price_product_enabled,
  } = options;
  const broadcast = useBroadcast();
  const { openModal } = useModal();

  const localStorageInStock = useLocalStorage<boolean>(IN_STOCK_PRODUCTS_LOCAL_STORAGE, true);
  const localStorageBranches = useLocalStorage<string[]>(FFC_LOCAL_STORAGE, []);

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

  const products = shallowRef<Product[]>([]);
  const facets = shallowRef<FacetItemType[]>([]);

  const prevProductsFilters = shallowRef<ProductsFiltersType>();
  const productsFilters = shallowRef<ProductsFiltersType>({
    branches: localStorageBranches.value,
    inStock: localStorageInStock.value,
    facets: [],
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
  }

  function removeFacetFilter(payload: Pick<FacetItemType, "paramName"> & Pick<FacetValueItemType, "value">): void {
    const facet = productsFilters.value.facets.find((item) => item.paramName === payload.paramName);
    const facetValue = facet?.values.find((item) => item.value === payload.value);

    if (facetValue) {
      facetValue.selected = false;
      facetsQueryParam.value = options?.useQueryParams ? getFilterExpressionFromFacets(facets) : "";

      triggerRef(facets);
    }
  }

  function resetFacetFilters(): void {
    facetsQueryParam.value = "";

    productsFilters.value.facets.forEach((filter) =>
      filter.values.forEach((filterItem) => (filterItem.selected = false)),
    );

    triggerRef(facets);
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
        },
      },
    });
  }

  function hasSelectedFacets(): boolean {
    return facets.value?.some((facet) => facet.values.some((value) => value.selected));
  }

  function setFacets({ termFacets = [], rangeFacets = [] }: { termFacets?: TermFacet[]; rangeFacets?: RangeFacet[] }) {
    if (config.product_filters_sorting) {
      const ascDirection = config.product_filters_sorting_direction === SortDirection.Ascending;

      termFacets.sort((a, b) => (ascDirection ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label)));
      rangeFacets.sort((a, b) => (ascDirection ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label)));
    }

    facets.value = Array<FacetItemType>().concat(
      termFacets.map(termFacetToCommonFacet),
      rangeFacets.map(rangeFacetToCommonFacet),
    );
  }

  async function fetchProducts(searchParams: Partial<ProductsSearchParamsType>) {
    fetchingProducts.value = true;
    products.value = [];
    totalProductsCount.value = 0;
    pagesCount.value = 1;

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

      products.value = products.value.concat(items);
      totalProductsCount.value = totalCount;
      pagesCount.value = Math.min(
        Math.ceil(totalProductsCount.value / (searchParams.itemsPerPage || DEFAULT_ITEMS_PER_PAGE)),
        PAGE_LIMIT,
      );
    } catch (e) {
      Logger.error(`useProducts.${fetchMoreProducts.name}`, e);
      throw e;
    } finally {
      fetchingMoreProducts.value = false;
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

  broadcast.on(productsInWishlistEvent, (eventItems: ProductInWishlistEventDataType[]) => {
    let trigger = false;

    eventItems.forEach(({ productId, inWishlist }) => {
      const { index, product } = productsById.value[productId] ?? {};

      if (product) {
        products.value.splice(index, 1, { ...product, inWishlist });
        trigger = true;
      }
    });

    if (trigger) {
      triggerRef(products);
    }
  });

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
    products: computed(() => /** @see: https://github.com/vuejs/core/issues/8036 */ products.value.slice()),
    productsById,
    productsFilters: computed(() => productsFilters.value),
    searchQueryParam,
    sortQueryParam,
    totalProductsCount: readonly(totalProductsCount),

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
