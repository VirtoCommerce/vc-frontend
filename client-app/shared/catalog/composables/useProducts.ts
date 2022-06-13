import { Ref, ref, computed, readonly, shallowRef, shallowReactive } from "vue";
import { searchProducts } from "@core/api/graphql/catalog";
import { Product } from "@core/api/graphql/types";
import { Logger } from "@core/utilities";
import { ProductsFacet, ProductsSearchParams } from "../types";
import {
  ProductsFilters,
  rangeFacetToProductsFilter,
  termFacetToProductsFilter,
  toFilterExpression,
} from "@/shared/catalog";
import { IN_STOCK_FILTER_EXPRESSION } from "@/core/constants";
import _ from "lodash";

const DEFAULT_ITEMS_PER_PAGE = 16;

export default (
  options: {
    // @default false
    withFacets?: boolean;
  } = {}
) => {
  const { withFacets: withFacets = false } = options;

  const loading = ref(true);
  const loadingMore = ref(false);
  const facetsLoading = ref(false);
  const products: Ref<Product[]> = shallowRef([]);
  const filters = shallowReactive<ProductsFilters>({ facets: [], inStock: false });
  const total: Ref<number> = ref(0);
  const pages: Ref<number> = ref(1);

  async function fetchProducts(searchParams: Partial<ProductsSearchParams>) {
    loading.value = true;
    products.value = [];
    total.value = 0;
    pages.value = 1;

    try {
      if (searchParams.filter?.includes(IN_STOCK_FILTER_EXPRESSION)) {
        // FIXME: don't use it here
        filters.inStock = true;
      }

      if (!searchParams.filter?.includes(IN_STOCK_FILTER_EXPRESSION) && filters.inStock) {
        // FIXME: don't use it here
        searchParams.filter = toFilterExpression(filters);
      }

      const {
        items = [],
        term_facets = [],
        range_facets = [],
        totalCount = 0,
      } = await searchProducts(searchParams, { withFacets });

      products.value = items;
      total.value = totalCount;
      pages.value = Math.ceil(total.value / (searchParams.itemsPerPage || DEFAULT_ITEMS_PER_PAGE));

      if (withFacets) {
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

  async function getFacets(searchParams: Partial<ProductsSearchParams>): Promise<ProductsFacet[]> {
    facetsLoading.value = true;

    try {
      const paramsClone = _.cloneDeep(searchParams);
      paramsClone.page = 0;
      paramsClone.itemsPerPage = 0;

      const {
        term_facets = [],
        range_facets = [],
        totalCount = 0,
      } = await searchProducts(searchParams, { withFacets: true });

      term_facets.sort((a, b) => a.label.localeCompare(b.label));
      range_facets.sort((a, b) => a.label.localeCompare(b.label));
      const facets = Array<ProductsFacet>().concat(
        term_facets.map(termFacetToProductsFilter),
        range_facets.map(rangeFacetToProductsFilter)
      );

      return facets;
    } catch (e) {
      Logger.error(`useProducts.${getFacets.name}`, e);
      throw e;
    } finally {
      facetsLoading.value = false;
    }
  }

  return {
    filters,
    fetchProducts,
    fetchMoreProducts,
    getFacets,
    total: readonly(total),
    pages: readonly(pages),
    loading: readonly(loading),
    loadingMore: readonly(loadingMore),
    facetsLoading: readonly(facetsLoading),
    products: computed(() => products.value),
  };
};
