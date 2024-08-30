<template>
  <VcWidget
    v-if="recommendedProducts.length"
    :title="$t('pages.product.recommended_products_section_title')"
    prepend-icon="cube"
    size="lg"
  >
    <VcProductsGrid short>
      <ProductCardRecommended v-for="(item, index) in recommendedProducts" :key="index" :product="item" />
    </VcProductsGrid>
  </VcWidget>
</template>

<script setup lang="ts">
import { ProductCardRecommended } from "@/shared/catalog";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  recommendedProducts: Product[];
}
defineProps<IProps>();
</script>
