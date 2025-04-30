<template>
  <VcContainer>
    <VcTypography variant="h1">Price History</VcTypography>
    <PriceHistory />
    {{ result }} {{ loading }}
  </VcContainer>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { useGetPriceHistory } from "../api/graphql/queries/getPriceHistory";
import PriceHistory from "../components/price-history.vue";
import { PRICE_HISTORY_ITEMS_KEY } from "../constants";

const priceHistoryItems = useLocalStorage<string[]>(PRICE_HISTORY_ITEMS_KEY, []);
const { result, loading } = useGetPriceHistory(priceHistoryItems.value);
</script>
