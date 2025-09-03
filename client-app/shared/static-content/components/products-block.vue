<template>
  <div class="py-10 lg:py-24" :class="background">
    <div class="mx-auto w-full max-w-screen-xl px-5 md:px-12">
      <VcTypography tag="h2" variant="h1" class="mb-2 text-center lg:mb-4">
        {{ title }}
      </VcTypography>

      <div class="text-center lg:text-lg">{{ subtitle }}</div>

      <VcProductsGrid
        :columns="{
          default: 1,
          xs: 2,
          sm: 2,
          md: Number(columnsAmountTablet),
          lg: Number(columnsAmountDesktop),
          xl: Number(columnsAmountDesktop),
          '2xl': Number(columnsAmountDesktop),
        }"
      >
        <ProductCard v-for="(item, index) in products" :key="item.id" :card-type="cardType" :product="item" :index="index" />
      </VcProductsGrid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from "vue";
import { ProductCard, useProducts } from "@/shared/catalog";

interface IProps {
  id?: string;
  background?: string;
  title?: string;
  subtitle?: string;
  count?: number;
  query?: string;
  filter?: string;
  cardType?: "full" | "short";
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

watchEffect(async () => {
  await fetchProducts({
    itemsPerPage: props.count,
    keyword: props.query,
    filter: props.filter,
  });
});
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}
</style>
