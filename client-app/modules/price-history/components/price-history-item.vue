<template>
  <div class="price-history-item">
    <PriceChart :price-data="priceData" />
    <VcLabel>{{ product.name }}</VcLabel>
  </div>
</template>

<script setup lang="ts">
import PriceChart from "./price-chart.vue";

interface IProps {
  priceData: { price: number; date: string }[];
  product: {
    name: string;
  };
}

defineProps<IProps>();
</script>

<style lang="scss">
.price-history-item {
  @apply flex justify-start items-center gap-4;
}
</style>
