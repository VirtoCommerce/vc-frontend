import { computed, inject, readonly, ref, shallowRef } from "vue";
import { configInjectionKey } from "@/core/injection-keys";
import { Logger, rangeFacetToCommonFacet, termFacetToCommonFacet } from "@/core/utilities";
import { searchProducts } from "@/xapi/graphql/catalog";
import type { ProductsSearchParams } from "../types";
import type { FacetItemType } from "@/core/types";
import type { Product } from "@/xapi/types";

const DEFAULT_ITEMS_PER_PAGE = 16;

export default (
  options: {
    /** @default false */
    withFacets?: boolean;
    /** @default config.image_carousel_in_product_card_enabled */
    withImages?: boolean;
    /** @default config.zero_price_product_enabled */
    withZeroPrice?: boolean;
  } = {}
) => {
  const config = inject(configInjectionKey);
  const {
    withFacets = false,
    withImages = config?.image_carousel_in_product_card_enabled,
    withZeroPrice = config?.zero_price_product_enabled,
  } = options;

  const loading = ref(true);
  const loadingMore = ref(false);
  const facetsLoading = ref(false);
  const products = shallowRef<Product[]>([]);
  const facets = shallowRef<FacetItemType[]>([]);
  const total = ref(0);
  const pages = ref(1);

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
      } = await searchProducts(searchParams, { withFacets, withImages, withZeroPrice });

      products.value = items;
      total.value = totalCount;
      pages.value = Math.ceil(total.value / (searchParams.itemsPerPage || DEFAULT_ITEMS_PER_PAGE));

      if (withFacets) {
        term_facets.sort((a, b) => a.label.localeCompare(b.label));
        range_facets.sort((a, b) => a.label.localeCompare(b.label));

        facets.value = Array<FacetItemType>().concat(
          term_facets.map(termFacetToCommonFacet),
          range_facets.map(rangeFacetToCommonFacet)
        );
      }
    } catch (e) {
      Logger.error(`useProducts.${fetchProducts.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMoreProducts(searchParams: Partial<ProductsSearchParams>) {
    loadingMore.value = true;

    try {
      const { items = [], totalCount = 0 } = await searchProducts(searchParams, { withImages, withZeroPrice });

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

  async function getFacets(searchParams: Partial<ProductsSearchParams>): Promise<FacetItemType[]> {
    facetsLoading.value = true;

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
        range_facets.map(rangeFacetToCommonFacet)
      );
    } catch (e) {
      Logger.error(`useProducts.${getFacets.name}`, e);
      throw e;
    } finally {
      facetsLoading.value = false;
    }
  }

  return {
    facets,
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
