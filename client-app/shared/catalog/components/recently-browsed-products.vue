<template>
  <VcWidget
    v-if="products.length"
    :title="$t('pages.cart.recently_browsed_products')"
    prepend-icon="cursor-click"
    size="lg"
  >
    <VcProductsGrid short>
      <ProductCardRecentlyBrowsed
        v-for="product in products"
        :key="product.id"
        :product="product"
        :background="false"
      />
    </VcProductsGrid>
  </VcWidget>
</template>

<script setup lang="ts">
import type { Product } from "@/core/api/graphql/types";
import ProductCardRecentlyBrowsed from "@/shared/catalog/components/product-card-recently-browsed.vue";

interface IProps {
  products: Product[];
}
defineProps<IProps>();
</script>
