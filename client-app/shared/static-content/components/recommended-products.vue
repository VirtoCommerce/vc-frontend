<template>
  <VcWidget v-if="recommendedProducts?.length" :title="title" prepend-icon="cube" size="lg">
    <VcProductsGrid short>
      <ProductCardRecommended v-for="(item, index) in recommendedProducts" :key="index" :product="item" />
    </VcProductsGrid>
  </VcWidget>
</template>

<script setup lang="ts">
import { ProductCardRecommended } from "@/shared/catalog";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  recommendedProducts?: Product[];
  title: string;
}
defineProps<IProps>();
</script>
