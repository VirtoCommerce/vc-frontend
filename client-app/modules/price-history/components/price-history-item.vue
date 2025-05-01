<template>
  <div class="price-history-item">
    <PriceChart :price-data="priceData" class="price-history-item__price-chart" />

    <VcProductCard view-mode="list" class="price-history-item__product">
      <VcProductImage :images="product.images" :alt="product.name" />

      <VcProductTitle :to="getProductRoute(product.id, product.slug)" :title="product.name" lines-number="2" fix-height>
        {{ product.name }}
      </VcProductTitle>

      <VcProductVendor>{{ product.vendor?.name }}</VcProductVendor>

      <VcProductPrice :actual-price="product.price.actual" :list-price="product.price.list" />

      <AddToCart :product="product" />
    </VcProductCard>
  </div>
</template>

<script setup lang="ts">
import { getProductRoute } from "@/core/utilities";
import PriceChart from "./price-chart.vue";
import type { Product } from "@/core/api/graphql/types";
import AddToCart from "@/shared/cart/components/add-to-cart.vue";

interface IProps {
  priceData: { price: number; date: string }[];
  product: Product;
}

defineProps<IProps>();
</script>

<style lang="scss">
.price-history-item {
  @apply flex justify-start  gap-4 flex-col max-w-full container;

  @container (max-width: theme("containers.2xl")) {
    @apply flex-row items-center;
  }

  &__product {
    @apply w-full;
  }

  &__price-chart {
    @apply flex-shrink-0;

    @container (max-width: theme("containers.2xl")) {
      @apply w-[600px];
    }
  }
}
</style>
