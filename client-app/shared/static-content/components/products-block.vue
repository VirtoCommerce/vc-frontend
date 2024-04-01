<template>
  <div class="py-10 lg:py-24" :class="model.background">
    <div class="mx-auto w-full max-w-screen-xl px-5 md:px-12">
      <VcTypography tag="h2" variant="h1" class="mb-2 text-center lg:mb-4">
        {{ model.title }}
      </VcTypography>

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
import { useProductsRoutes } from "@/core/composables";
import { AddToCart } from "@/shared/cart";
import { ProductCardGrid, useProducts } from "@/shared/catalog";

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

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}
</style>
