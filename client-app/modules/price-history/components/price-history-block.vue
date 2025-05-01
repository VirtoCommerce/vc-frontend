<template>
  <VcWidget class="price-history-block" title="Price History" prepend-icon="table">
    <VcLoaderOverlay v-if="loading" />

    <PriceChart v-else :price-data="result.data[productId]" class="price-history-block__price-chart" />
  </VcWidget>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { useGetPriceHistory } from "../api/graphql/queries/getPriceHistory";
import PriceChart from "./price-chart.vue";

interface IProps {
  productId: string;
}

const props = defineProps<IProps>();

const productId = toRef(props, "productId");

const { result, loading } = useGetPriceHistory([productId.value]);
</script>

<style lang="scss">
.price-history-block {
  &__title {
    @apply mb-6;
  }
}
</style>
