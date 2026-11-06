<template>
  <ProductReviews v-if="product" :product-id="product.id" :product-rating="product.rating" />
</template>

<script setup lang="ts">
import ProductReviews from "./product-reviews.vue";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  /** The product of the page the section is on. */
  product?: Product;
}

defineProps<IProps>();
</script>
