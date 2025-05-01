<template>
  <div class="price-history">
    <template v-for="productId in Object.keys(data)" :key="productId">
      <PriceHistoryItem v-if="getProduct(productId)" :price-data="data[productId]" :product="getProduct(productId)!" />
    </template>
  </div>
</template>

<script setup lang="ts">
import PriceHistoryItem from "./price-history-item.vue";
import type { PriceHistoryItemType } from "../types";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  data: Record<string, PriceHistoryItemType[]>;
  products?: Product[];
}

const props = defineProps<IProps>();

function getProduct(productId: string): Product | undefined {
  return props.products?.find((product) => product.id === productId);
}
</script>

<style lang="scss">
.price-history {
  @apply @container flex flex-col gap-8 divide-y-2 divide-neutral-200;
}
</style>
