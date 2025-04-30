<template>
  <div class="price-history">
    <PriceChart v-for="productId in Object.keys(data)" :key="productId" currency="$" :price-data="data[productId]" />
  </div>
</template>

<script setup lang="ts">
import PriceChart from "./price-chart.vue";
import type { PriceHistoryItemType } from "../types";

interface IProps {
  data: Record<string, PriceHistoryItemType[]>;
}

defineProps<IProps>();
</script>
