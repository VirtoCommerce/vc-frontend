<template>
  <div class="py-10 lg:py-24" :class="model.background">
    <div class="w-full max-w-screen-xl mx-auto px-5 md:px-12">
      <h2 class="text-center font-bold text-3xl lg:text-4xl mb-2 lg:mb-4">{{ model.title }}</h2>
      <div class="text-center lg:text-lg">{{ model.subtitle }}</div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-4 mt-12">
        <ProductCardGrid v-for="item in products" :key="item.id" :product="item">
          <template #cart-handler>
            <VcButton v-if="item.hasVariations" :to="productsRoutes[item.id]" class="uppercase mb-4">
              {{ $t("pages.demo_landing.products_block.choose_button") }}
            </VcButton>

            <AddToCart v-else :product="item"></AddToCart>
          </template>
        </ProductCardGrid>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watchEffect } from "vue";
import { ProductCardGrid, useProducts, useProductsRoutes } from "@/shared/catalog";
import { AddToCart } from "@/shared/cart";

const { products, fetchProducts } = useProducts();
const productsRoutes = useProductsRoutes(products);

const props = defineProps({
  model: {
    type: Object,
    required: true,
  },
  settings: {
    type: Object,
    required: true,
  },
});

watchEffect(async () => {
  await fetchProducts({
    itemsPerPage: props.model.count || 4,
    keyword: props.model.query,
  });
});

onMounted(async () => {
  await fetchProducts({
    itemsPerPage: props.model.count || 4,
    keyword: props.model.query,
  });
});
</script>
