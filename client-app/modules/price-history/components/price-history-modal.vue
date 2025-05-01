<template>
  <VcModal title="Price History">
    <div v-if="loading" class="price-history-modal__loader">
      <VcLoaderOverlay />
    </div>

    <PriceHistory v-else :data="dataToShow" :products="productsToShow" />

    <template #actions="{ close }">
      <VcButton variant="secondary" :to="{ name: 'PriceHistory' }" @click="close">See all</VcButton>
      <VcButton @click="close">Close</VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";
import { useGetPriceHistory } from "../api/graphql/queries/getPriceHistory";
import { getProductDetails } from "../api/graphql/queries/getProductsDetails";
import { PRICE_HISTORY_ITEMS_KEY } from "../constants";
import PriceHistory from "./price-history.vue";
import type { Product } from "@/core/api/graphql/types";

const ITEMS_TO_SHOW = 5;

const priceHistoryItems = useLocalStorage<string[]>(PRICE_HISTORY_ITEMS_KEY, []);
const { result, loading } = useGetPriceHistory(priceHistoryItems.value);

interface IProductsResult {
  products?: {
    items: Product[];
  };
}

const { result: products } = getProductDetails({
  productIds: Object.keys(result.value.data).slice(0, ITEMS_TO_SHOW),
});

const dataToShow = computed(() => {
  return Object.fromEntries(Object.entries(result.value.data).slice(0, ITEMS_TO_SHOW));
});

const productsToShow = computed(() => {
  const productItems: Product[] = (products.value as IProductsResult)?.products?.items ?? [];
  return productItems.slice(0, ITEMS_TO_SHOW);
});
</script>

<style lang="scss">
.price-history-modal {
  &__loader {
    @apply min-h-60;
  }
}
</style>
