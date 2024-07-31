import { createGlobalState } from "@vueuse/core";
import { computed, inject, readonly, ref, shallowRef, triggerRef } from "vue";
import { searchProducts } from "@/core/api/graphql/catalog";
import { PAGE_LIMIT } from "@/core/constants";
import { SortDirection } from "@/core/enums";
import { configInjectionKey } from "@/core/injection-keys";
import { Logger, rangeFacetToCommonFacet, termFacetToCommonFacet } from "@/core/utilities";
import { productsInWishlistEvent, useBroadcast } from "@/shared/broadcast";
import type { ProductsSearchParamsType } from "../types";
import type { Product, RangeFacet, TermFacet } from "@/core/api/graphql/types";
import type { FacetItemType } from "@/core/types";
import type { ProductInWishlistEventDataType } from "@/shared/broadcast";

const DEFAULT_ITEMS_PER_PAGE = 16;

function _useProducts(
  options: {
    /** @default false */
    withFacets?: boolean;
    /** @default config.image_carousel_in_product_card_enabled */
    withImages?: boolean;
    /** @default config.zero_price_product_enabled */
    withZeroPrice?: boolean;
  } = {},
) {
  const config = inject(configInjectionKey, {});
  const {
    withFacets = false,
    withImages = config.image_carousel_in_product_card_enabled,
    withZeroPrice = config.zero_price_product_enabled,
  } = options;
  const broadcast = useBroadcast();

  const loading = ref(true);
  const loadingMore = ref(false);
  const facetsLoading = ref(false);
  const products = shallowRef<Product[]>([]);
  const facets = shallowRef<FacetItemType[]>([]);
  const total = ref(0);
  const pages = ref(1);

  const productsById = computed(() =>
    products.value.reduce(
      (result, product, index) => {
        result[product.id] = { index, product };
        return result;
      },
      {} as Record<string, { index: number; product: Product }>,
    ),
  );

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
      pages.value = Math.min(
        Math.ceil(total.value / (searchParams.itemsPerPage || DEFAULT_ITEMS_PER_PAGE)),
        PAGE_LIMIT,
      );

      if (withFacets) {
        setFacets({
          termFacets: term_facets,
          rangeFacets: range_facets,
        });
      }
    } catch (e) {
      Logger.error(`useProducts.${fetchProducts.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMoreProducts(searchParams: Partial<ProductsSearchParamsType>) {
    loadingMore.value = true;

    try {
      const { items = [], totalCount = 0 } = await searchProducts(searchParams, { withImages, withZeroPrice });

      products.value = products.value.concat(items);
      total.value = totalCount;
      pages.value = Math.min(
        Math.ceil(total.value / (searchParams.itemsPerPage || DEFAULT_ITEMS_PER_PAGE)),
        PAGE_LIMIT,
      );
    } catch (e) {
      Logger.error(`useProducts.${fetchMoreProducts.name}`, e);
      throw e;
    } finally {
      loadingMore.value = false;
    }
  }

  async function getFacets(searchParams: Partial<ProductsSearchParamsType>): Promise<FacetItemType[]> {
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
        range_facets.map(rangeFacetToCommonFacet),
      );
    } catch (e) {
      Logger.error(`useProducts.${getFacets.name}`, e);
      throw e;
    } finally {
      facetsLoading.value = false;
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
    productsById,
    fetchProducts,
    fetchMoreProducts,
    getFacets,
    total: readonly(total),
    pages: readonly(pages),
    loading: readonly(loading),
    loadingMore: readonly(loadingMore),
    facetsLoading: readonly(facetsLoading),
    products: computed(() => /** @see: https://github.com/vuejs/core/issues/8036 */ products.value.slice()),
  };
}

export const useProducts = createGlobalState(_useProducts);
