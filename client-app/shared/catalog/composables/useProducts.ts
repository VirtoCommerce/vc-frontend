import { Ref, ref, computed, watch } from "vue";
import { searchProducts, searchRelatedProducts, getProduct } from "@core/api/graphql/catalog";
import { Product } from "@core/api/graphql/types";
import { Logger } from "@core/utilities";
import { ProductsSearchParams } from "../types";
import { useCart } from "@/shared/cart";
import _ from "lodash";

export default () => {
  const products: Ref<Product[]> = ref([]);
  const relatedProducts: Ref<Product[]> = ref([]);
  const product: Ref<Product> = ref({ code: "", id: "", name: "", price: {} });
  const total: Ref<number> = ref(0);
  const pages: Ref<number> = ref(0);
  const loading: Ref<boolean> = ref(true);
  const withVariations = computed(() => product.value.variations?.length);
  const variationsCartTotal = ref(0);

  const { loading: cartLoading, getItemsTotal } = useCart();

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
      const productsConnection = await searchProducts(searchParams);
      products.value = productsConnection?.items as Product[];
      //normalize prices

      total.value = productsConnection.totalCount ?? 0;
      pages.value = Math.ceil(total.value / (searchParams.itemsPerPage || 16));
    } catch (e) {
      Logger.error("useProducts.fetchProducts", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

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
    fetchProducts,
    loadProduct,
    fetchRelatedProducts,
    relatedProducts: computed(() => relatedProducts.value),
    products: computed(() => products.value),
    product: computed(() => product.value),
    total: computed(() => total.value),
    pages: computed(() => pages.value),
    loading: computed(() => loading.value),
    withVariations: computed(() => withVariations.value),
    variationsCartTotal: computed(() => variationsCartTotal.value),
  };
};
