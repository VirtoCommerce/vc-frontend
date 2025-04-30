<template>
  <VcModal title="Price History">
    <PriceHistory :data="{ test: [] }" />
  </VcModal>
</template>

<script setup lang="ts">
import PriceHistory from "@/modules/price-history/components/price-history.vue";
</script>
