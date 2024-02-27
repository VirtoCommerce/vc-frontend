<template>
  <div class="py-10 lg:py-24" :class="model.background">
    <div class="mx-auto w-full max-w-screen-xl px-5 md:px-12">
      <h2 class="mb-2 text-center text-3xl font-bold lg:mb-4 lg:text-4xl">{{ model.title }}</h2>
      <div class="text-center lg:text-lg">{{ model.subtitle }}</div>

      <div class="grid gap-6 xs:grid-cols-2 md:grid-cols-3 lg:gap-5 xl:grid-cols-4">
        <ProductCardGrid v-for="item in products" :key="item.id" :product="item">
          <template #cart-handler>
            <VcButton v-if="item.hasVariations" :to="productsRoutes[item.id]" class="mb-4">
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
import { watchEffect } from "vue";
import { useProductsRoutes } from "@/core/composables/useProductsRoutes";
import { useProducts } from "@/shared/catalog/composables/useProducts";
import AddToCart from "@/shared/cart/components/add-to-cart.vue";
import ProductCardGrid from "@/shared/catalog/components/product-card-grid.vue";

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
const { products, fetchProducts } = useProducts();
const productsRoutes = useProductsRoutes(products);

watchEffect(async () => {
  await fetchProducts({
    itemsPerPage: props.model.count || 4,
    keyword: props.model.query,
  });
});
</script>
