<template>
  <VcWidget
    v-if="recommendedProducts?.length"
    :title="title"
    prepend-icon="cube"
    size="lg"
    data-name="product-list"
    :data-list-id="`recommended_products_${model}`"
    :data-list-name="`${title} ${productName}`"
    :data-related-id="productId"
    data-related-type="product"
  >
    <VcProductsGrid short :columns="{ md: 5, lg: 6, '2xl': 7 }">
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
  model: string;
  productId: string;
  productName: string;
}

defineProps<IProps>();
</script>
