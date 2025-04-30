<template>
  <div class="price-history">
    <PriceHistoryItem
      v-for="productId in Object.keys(data)"
      :key="productId"
      :price-data="data[productId]"
      :product="{ name: productId }"
    />
  </div>
</template>

<script setup lang="ts">
import PriceHistoryItem from "./price-history-item.vue";
import type { PriceHistoryItemType } from "../types";

interface IProps {
  data: Record<string, PriceHistoryItemType[]>;
  products?: unknown;
}

defineProps<IProps>();
</script>

<style lang="scss">
.price-history {
  @apply flex flex-col gap-4;
}
</style>
