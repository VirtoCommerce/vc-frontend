<template>
  <RelatedProducts
    v-if="product"
    :related-products="relatedProducts"
    :product-id="product.id"
    :product-name="product.name"
  />
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useLoyaltyCatalogCurrency } from "@/shared/catalog/composables/useLoyaltyCatalogCurrency";
import { useRelatedProducts } from "@/shared/catalog/composables/useRelatedProducts";
import RelatedProducts from "./related-products.vue";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product?: Product;
}

const props = defineProps<IProps>();

const RELATED_PRODUCTS_LIMIT = 30;

const { relatedProducts, fetchRelatedProducts } = useRelatedProducts();
const loyaltyCurrencyOverride = useLoyaltyCatalogCurrency();

watch(
  () => props.product?.id,
  async (productId) => {
    if (productId && props.product?.associations?.totalCount) {
      await fetchRelatedProducts({
        productId,
        itemsPerPage: RELATED_PRODUCTS_LIMIT,
        currencyCodeOverride: loyaltyCurrencyOverride.value,
      });
    }
  },
  { immediate: true },
);
</script>
