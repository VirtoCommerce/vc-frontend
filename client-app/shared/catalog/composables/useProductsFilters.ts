import { useLocalStorage } from "@vueuse/core";
import { cloneDeep, isEqual } from "lodash";
import { computed, readonly, ref, shallowRef, triggerRef, watchEffect } from "vue";
import { useRouteQueryParam } from "@/core/composables";
import { FFC_LOCAL_STORAGE, IN_STOCK_PRODUCTS_LOCAL_STORAGE, PRODUCT_SORTING_LIST } from "@/core/constants";
import { QueryParamName } from "@/core/enums";
import { getFilterExpressionFromFacets } from "@/core/utilities";
import { useModal } from "@/shared/modal";
import { useProducts } from "./useProducts";
import type { FiltersDisplayOrderType, ProductsFiltersType } from "../types";
import type { FacetItemType, FacetValueItemType } from "@/core/types";
import BranchesModal from "@/shared/fulfillmentCenters/components/branches-modal.vue";

export function useProductFilters(options: {
  isMobile: boolean;
  filtersDisplayOrder?: FiltersDisplayOrderType;
  useQueryParams?: boolean;
}) {
  const { openModal } = useModal();
  const { facets } = useProducts();

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

  const prevProductsFilters = shallowRef<ProductsFiltersType>();
  const productsFilters = shallowRef<ProductsFiltersType>({
    branches: localStorageBranches.value,
    inStock: localStorageInStock.value,
    facets: [],
  });

  const isFiltersSidebarVisible = ref(false);

  function getSortedFacets(allFacets: FacetItemType[]): FacetItemType[] {
    if (options.filtersDisplayOrder?.order && options.filtersDisplayOrder?.order.length) {
      const order = options.filtersDisplayOrder.order
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

      return options.filtersDisplayOrder?.showRest
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

    if (options.useQueryParams && facetsQueryParam.value !== facetsFilterExpression) {
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
      facetsQueryParam.value = options.useQueryParams ? getFilterExpressionFromFacets(facets) : "";

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

  function updateProductsFilters(newFilters: ProductsFiltersType): void {
    productsFilters.value = newFilters;
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

  watchEffect(() => {
    if (facets) {
      productsFilters.value = {
        inStock: localStorageInStock.value,
        branches: localStorageBranches.value.slice(),
        facets: options.isMobile ? getSortedFacets(facets.value) : facets.value,
      };
    }
  });

  return {
    hasSelectedFacets: computed(() => hasSelectedFacets()),
    isFiltersDirty: computed(() => !isEqual(prevProductsFilters.value, productsFilters.value)),
    isFiltersSidebarVisible: readonly(isFiltersSidebarVisible),
    localStorageBranches: computed(() => localStorageBranches.value),
    localStorageInStock: computed(() => localStorageInStock.value),
    sortQueryParam: readonly(sortQueryParam),
    searchQueryParam: readonly(searchQueryParam),
    keywordQueryParam: readonly(keywordQueryParam),
    facetsQueryParam: readonly(facetsQueryParam),
    productsFilters: computed(() => productsFilters.value),
    applyFilters,
    hideFiltersSidebar,
    openBranchesModal,
    removeFacetFilter,
    resetFacetFilters,
    showFiltersSidebar,
    updateProductsFilters,
  };
}
