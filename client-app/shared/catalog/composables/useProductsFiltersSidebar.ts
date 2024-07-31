import { cloneDeep, isEqual } from "lodash";
import { computed, readonly, ref, shallowRef } from "vue";
import type { FacetItemType, FacetValueItemType } from "@/core/types";
import type { FiltersDisplayOrderType, ProductsFilters as ProductsFiltersType } from "@/shared/catalog";
import type { MaybeRef } from "vue";

export function useProductsFiltersSidebar(isMobile: MaybeRef<boolean>) {
  const prevProductsFilters = shallowRef<ProductsFiltersType>();
  const productsFilters = shallowRef<ProductsFiltersType>({
    inStock: true,
    branches: [],
    facets: [],
  });

  const isFiltersSidebarVisible = ref(false);

  function getSortedFacets(facets: FacetItemType[], displayOrder?: FiltersDisplayOrderType): FacetItemType[] {
    if (!displayOrder?.order?.length) {
      return facets;
    }

    const sortOrder = displayOrder.order
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    if (!sortOrder.length) {
      return facets;
    }

    const sortedFacets: FacetItemType[] = [];

    sortOrder.forEach((filter) => {
      const facet = facets.find(({ label }) => label.toLowerCase() === filter);
      if (facet) {
        sortedFacets.push(facet);
      }
    });

    return displayOrder.showRest
      ? [...sortedFacets, ...facets.filter(({ label }) => !sortOrder.includes(label.toLowerCase()))]
      : sortedFacets;
  }

  function initializeFiltersSidebar(params: {
    inStock: boolean;
    branches: string[];
    facets: FacetItemType[];
    filtersDisplayOrder?: FiltersDisplayOrderType;
  }): void {
    productsFilters.value = {
      inStock: params.inStock,
      branches: params.branches,
      facets: isMobile ? getSortedFacets(params.facets, params.filtersDisplayOrder) : params.facets,
    };
  }

  function showFiltersSidebar(): void {
    prevProductsFilters.value = cloneDeep(productsFilters.value);

    isFiltersSidebarVisible.value = true;
  }

  function hideFiltersSidebar(): void {
    isFiltersSidebarVisible.value = false;
  }

  function updateProductsFilters(newFilters: ProductsFiltersType): void {
    productsFilters.value = newFilters;
  }

  function removeFacetFilter(payload: Pick<FacetItemType, "paramName"> & Pick<FacetValueItemType, "value">): boolean {
    const facet = productsFilters.value.facets.find((item) => item.paramName === payload.paramName);
    const facetValue = facet?.values.find((item) => item.value === payload.value);

    if (facetValue) {
      facetValue.selected = false;
    }

    return !!facetValue;
  }

  function resetFacetsFilters(): void {
    productsFilters.value.facets.forEach((facet) => facet.values.forEach((value) => (value.selected = false)));
  }

  return {
    hasSelectedFilters: computed(() =>
      productsFilters.value.facets.some((facet) => facet.values.some((value) => value.selected)),
    ),
    isFiltersDirty: computed(() => {
      return !isEqual(productsFilters.value, prevProductsFilters.value);
    }),
    isFiltersSidebarVisible: readonly(isFiltersSidebarVisible),
    productsFilters: computed(() => productsFilters.value),
    hideFiltersSidebar,
    initializeFiltersSidebar,
    removeFacetFilter,
    resetFacetsFilters,
    showFiltersSidebar,
    updateProductsFilters,
  };
}
