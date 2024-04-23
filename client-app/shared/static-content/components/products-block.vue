<template>
  <div class="py-10 lg:py-24" :class="background">
    <div class="mx-auto w-full max-w-screen-xl px-5 md:px-12">
      <VcTypography tag="h2" variant="h1" class="mb-2 text-center lg:mb-4">
        {{ title }}
      </VcTypography>

      <div class="text-center lg:text-lg">{{ subtitle }}</div>

      <div
        :class="[
          'grid grid-cols-1 gap-6 xs:grid-cols-2 lg:gap-5',
          `md:grid-cols-${columnsAmountTablet}`,
          `lg:grid-cols-${columnsAmountDesktop}`,
        ]"
      >
        <template v-if="cardType === 'full'">
          <ProductCardGrid v-for="item in products" :key="item.id" :product="item">
            <template #cart-handler>
              <VcButton v-if="item.hasVariations" :to="productsRoutes[item.id]" class="mb-4">
                {{ $t("pages.demo_landing.products_block.choose_button") }}
              </VcButton>

              <AddToCart v-else :product="item"></AddToCart>
            </template>
          </ProductCardGrid>
        </template>
        <template v-if="cardType === 'short'">
          <ProductCardRelated v-for="item in products" :key="item.id" :product="item" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from "vue";
import { useProductsRoutes } from "@/core/composables";
import { AddToCart } from "@/shared/cart";
import { ProductCardGrid, useProducts } from "@/shared/catalog";
import ProductCardRelated from "@/shared/catalog/components/product-card-related.vue";

interface IProps {
  id: string;
  background?: string;
  title?: string;
  subtitle?: string;
  count?: number;
  query?: string;
  cardType?: string;
  columnsAmountDesktop?: string;
  columnsAmountTablet?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  cardType: "full",
  count: 4,
  columnsAmountDesktop: "4",
  columnsAmountTablet: "3",
});

const { products, fetchProducts } = useProducts();
const productsRoutes = useProductsRoutes(products);

watchEffect(async () => {
  await fetchProducts({
    itemsPerPage: props.count,
    filter: props.query,
  });
});
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}
</style>
