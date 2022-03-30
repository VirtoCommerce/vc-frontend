import { Ref, ref, computed, readonly, shallowRef } from "vue";
import { searchProducts } from "@core/api/graphql/catalog";
import { Product } from "@core/api/graphql/types";
import { Logger } from "@core/utilities";
import { ProductsFilter, ProductsSearchParams } from "../types";
import { rangeFacetToProductsFilter, termFacetToProductsFilter } from "@/shared/catalog";

export default (
  options: {
    // @default false
    withFilters?: boolean;
  } = {}
) => {
  const { withFilters = false } = options;

  const loading: Ref<boolean> = ref(true);
  const loadingMore: Ref<boolean> = ref(false);
  const products: Ref<Product[]> = shallowRef([]);
  const filters: Ref<ProductsFilter[]> = shallowRef([]);
  const total: Ref<number> = ref(0);
  const pages: Ref<number> = ref(1);

  async function fetchProducts(searchParams: Partial<ProductsSearchParams>) {
    loading.value = true;
    products.value = [];
    total.value = 0;
    pages.value = 1;

    try {
      const {
        items = [],
        term_facets = [],
        range_facets = [],
        totalCount = 0,
      } = await searchProducts(searchParams, { withFacets: withFilters });

      products.value = items;
      total.value = totalCount;
      pages.value = Math.ceil(total.value / (searchParams.itemsPerPage || 16));

      if (withFilters) {
        filters.value = [
          ...term_facets.sort((a, b) => a.label.localeCompare(b.label)).map(termFacetToProductsFilter),
          ...range_facets.sort((a, b) => a.label.localeCompare(b.label)).map(rangeFacetToProductsFilter),
        ];
      }
    } catch (e) {
      Logger.error("useProducts.fetchProducts", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMoreProducts(searchParams: Partial<ProductsSearchParams>) {
    loadingMore.value = true;

    try {
      const { items = [], totalCount = 0 } = await searchProducts(searchParams);

      products.value = products.value.concat(items);
      total.value = totalCount;
      pages.value = Math.ceil(total.value / (searchParams.itemsPerPage || 16));
    } catch (e) {
      Logger.error(`useProducts.${fetchMoreProducts.name}`, e);
      throw e;
    } finally {
      loadingMore.value = false;
    }
  }

  return {
    filters,
    fetchProducts,
    fetchMoreProducts,
    total: readonly(total),
    pages: readonly(pages),
    loading: readonly(loading),
    loadingMore: readonly(loadingMore),
    products: computed(() => products.value),
  };
};
