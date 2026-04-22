<template>
  <ProductPage :key="productId" :product-id="productId" :allow-set-meta="allowSetMeta" />
</template>

<script setup lang="ts">
import ProductPage from "./product.vue";

interface IProps {
  productId?: string;
  allowSetMeta?: boolean;
}

defineProps<IProps>();
</script>
