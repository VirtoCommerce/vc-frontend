import { ProductsFilters } from "./../types/search";
import { Ref, ref, computed, readonly, shallowRef, shallowReactive } from "vue";
import { searchProducts } from "@core/api/graphql/catalog";
import { Product } from "@core/api/graphql/types";
import { Logger } from "@core/utilities";
import { ProductsFacet, ProductsSearchParams } from "../types";
import { rangeFacetToProductsFilter, termFacetToProductsFilter, toFilterExpression } from "@/shared/catalog";
import { inStockFilterExpression } from "@/core/constants";

const DEFAULT_ITEMS_PER_PAGE = 16;

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
  const filters = shallowReactive<ProductsFilters>({ facets: [], inStock: false });
  const total: Ref<number> = ref(0);
  const pages: Ref<number> = ref(1);
  // todo: move this to a main filter data model with facets
  // const showInStock: Ref<boolean> = ref(false);

  async function fetchProducts(searchParams: Partial<ProductsSearchParams>) {
    loading.value = true;
    products.value = [];
    total.value = 0;
    pages.value = 1;

    try {
      if (searchParams.filter?.includes(inStockFilterExpression)) {
        filters.inStock = true;
      }

      if (!searchParams.filter?.includes(inStockFilterExpression) && filters.inStock === true) {
        searchParams.filter = toFilterExpression(filters);
      }

      const {
        items = [],
        term_facets = [],
        range_facets = [],
        totalCount = 0,
      } = await searchProducts(searchParams, { withFacets: withFilters });

      products.value = items;
      total.value = totalCount;
      pages.value = Math.ceil(total.value / (searchParams.itemsPerPage || DEFAULT_ITEMS_PER_PAGE));

      if (withFilters) {
        term_facets.sort((a, b) => a.label.localeCompare(b.label));
        range_facets.sort((a, b) => a.label.localeCompare(b.label));
        filters.facets = Array<ProductsFacet>().concat(
          term_facets.map(termFacetToProductsFilter),
          range_facets.map(rangeFacetToProductsFilter)
        );
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
      pages.value = Math.ceil(total.value / (searchParams.itemsPerPage || DEFAULT_ITEMS_PER_PAGE));
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
