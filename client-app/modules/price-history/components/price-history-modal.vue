<template>
  <VcModal title="Price History">
    <PriceHistory :data="{ test: [] }" />
  </VcModal>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { computed, onMounted } from "vue";
import { getProductDetails } from "@/modules/price-history/api/graphql/queries/getProductsDetails";
import { PRICE_HISTORY_ITEMS_KEY } from "@/modules/price-history/constants";
import PriceHistory from "@/modules/price-history/components/price-history.vue";

const productsIds = useLocalStorage<string[]>(PRICE_HISTORY_ITEMS_KEY, []);

const queryParams = computed(() => {
  return { productIds: productsIds.value };
});
onMounted(() => {
  const data = getProductDetails(queryParams);
  console.log(data);
});
</script>
