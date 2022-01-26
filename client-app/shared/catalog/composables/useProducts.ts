import { Ref, ref, computed, watch, shallowRef } from "vue";
import { searchProducts, searchRelatedProducts, getProduct } from "@core/api/graphql/catalog";
import { FacetRangeType, Product, RangeFacet, TermFacet } from "@core/api/graphql/types";
import { Logger } from "@core/utilities";
import { ProductsSearchParams } from "../types";
import { useCart } from "@/shared/cart";
import _ from "lodash";

const regexpForRangeFacetValue = /^[[(](\d\.?\d* )?TO( \d\.?\d*)?[\])]$/; // examples: (TO 100] or [1 TO 20] or [10 TO)

function getFilterValueFromRangeFacet(facetRange: FacetRangeType): string {
  const { from, to } = facetRange;

  const firstCondition = from ? `[${from} ` : "(";
  const lastCondition = to ? ` ${to}]` : ")";

  return `${firstCondition}TO${lastCondition}`;
}

export default () => {
  const products: Ref<Product[]> = ref([]);
  const termFacets: Ref<TermFacet[]> = shallowRef([]);
  const rangeFacets: Ref<RangeFacet[]> = shallowRef([]);
  const selectedFacets: Ref<Record<string, string[]>> = ref({});
  const relatedProducts: Ref<Product[]> = ref([]);
  const product: Ref<Product> = ref({ code: "", id: "", name: "", price: {} });
  const total: Ref<number> = ref(0);
  const pages: Ref<number> = ref(0);
  const loading: Ref<boolean> = ref(true);
  const withVariations = computed(() => product.value.variations?.length);
  const variationsCartTotal = ref(0);

  const { loading: cartLoading, getItemsTotal } = useCart();

  /**
   * Learn more about filter syntax:
   * https://github.com/VirtoCommerce/vc-module-experience-api/blob/master/docs/filter-syntax.md#filters
   * https://github.com/VirtoCommerce/vc-module-experience-api/blob/master/docs/x-catalog-reference.md#filter-by-price
   */
  const filterStringFromSelectedFacets = computed<string>(() => {
    const result: string[] = [];

    for (const facetName in selectedFacets.value) {
      const selectedValues: string[] = selectedFacets.value[facetName];

      if (!selectedValues.length) continue;

      const conditions = regexpForRangeFacetValue.test(selectedValues[0])
        ? `${selectedValues.join(",")}` // Ranges
        : `"${selectedValues.join('","')}"`; // Terms

      result.push(`"${facetName}":${conditions}`);
    }

    return result.join(" ");
  });

  async function fetchRelatedProducts(id: string) {
    loading.value = true;
    try {
      const associations = await searchRelatedProducts(id);
      relatedProducts.value = associations?.map((x) => x.product) as Product[];
    } catch (e) {
      Logger.error("useProducts.fetchRelatedProducts", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function loadProduct(id: string) {
    loading.value = true;
    try {
      product.value = await getProduct(id);
    } catch (e) {
      Logger.error("useProducts.loadProduct", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchProducts(searchParams: ProductsSearchParams) {
    loading.value = true;
    try {
      const { items = [], term_facets = [], range_facets = [], totalCount = 0 } = await searchProducts(searchParams);

      products.value = items;
      termFacets.value = term_facets;
      rangeFacets.value = range_facets;
      //normalize prices

      total.value = totalCount;
      pages.value = Math.ceil(total.value / (searchParams.itemsPerPage || 16));
    } catch (e) {
      Logger.error("useProducts.fetchProducts", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  //calculation of total price of variations in the cart
  watch(
    () => cartLoading.value === false && loading.value === false,
    (condition) => {
      if (condition && product.value.variations?.length) {
        const variationsIds = _(product.value.variations)
          .filter((x) => !!x?.id)
          .map((x) => x?.id as string)
          .value();

        variationsIds.push(product.value.id);

        variationsCartTotal.value = getItemsTotal(variationsIds);
      }
    }
  );

  return {
    selectedFacets,
    filterStringFromSelectedFacets,
    getFilterValueFromRangeFacet,
    fetchProducts,
    loadProduct,
    fetchRelatedProducts,
    relatedProducts: computed(() => relatedProducts.value),
    products: computed(() => products.value),
    termFacets: computed(() => termFacets.value),
    rangeFacets: computed(() => rangeFacets.value),
    product: computed(() => product.value),
    total: computed(() => total.value),
    pages: computed(() => pages.value),
    loading: computed(() => loading.value),
    withVariations: computed(() => withVariations.value),
    variationsCartTotal: computed(() => variationsCartTotal.value),
  };
};
