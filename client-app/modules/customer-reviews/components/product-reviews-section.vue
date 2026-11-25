<template>
  <ProductReviews v-if="product" :product-id="product.id" :product-rating="product.rating" />
</template>

<script setup lang="ts">
import ProductReviews from "./product-reviews.vue";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product?: Product;
}

defineProps<IProps>();
</script>
