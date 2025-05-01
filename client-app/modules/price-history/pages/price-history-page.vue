<template>
  <VcContainer class="price-history-page">
    <VcTypography class="price-history-page__title" variant="h1">Price History</VcTypography>

    <div v-if="loading" class="price-history-page__loader">
      <VcLoaderOverlay />
    </div>

    <VcLoaderOverlay v-if="loading" />

    <PriceHistory v-else :data="result.data" :products="products.products.items" />
  </VcContainer>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { useGetPriceHistory } from "../api/graphql/queries/getPriceHistory";
import { getProductDetails } from "../api/graphql/queries/getProductsDetails";
import PriceHistory from "../components/price-history.vue";
import { PRICE_HISTORY_ITEMS_KEY } from "../constants";

const priceHistoryItems = useLocalStorage<string[]>(PRICE_HISTORY_ITEMS_KEY, []);
const { result, loading } = useGetPriceHistory(priceHistoryItems.value);

const { result: products } = getProductDetails({
  productIds: priceHistoryItems.value,
});
</script>

<style lang="scss">
.price-history-page {
  &__title {
    @apply mb-6;
  }

  &__loader {
    @apply min-h-60;
  }
}
</style>
