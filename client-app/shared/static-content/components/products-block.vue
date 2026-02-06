<template>
  <div class="products-block py-10 lg:py-24" :class="background">
    <div class="mx-auto w-full max-w-screen-xl px-5 md:px-12">
      <VcTypography tag="h2" variant="h1" class="mb-2 text-center lg:mb-4">
        {{ title }}
      </VcTypography>

      <div class="mb-8 text-center lg:text-lg">{{ subtitle }}</div>

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
        <ProductCard v-for="item in displayProducts" :key="item.id" :card-type="cardType" :product="item" />
      </VcProductsGrid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
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
  skus?: Array<{ sku: string }>;
}

const props = withDefaults(defineProps<IProps>(), {
  cardType: "full",
  count: 4,
  columnsAmountDesktop: "4",
  columnsAmountTablet: "3",
});

const { products, fetchProducts } = useProducts();

const skuCodes = computed(() => {
  const skus = Array.from(new Set(props.skus?.filter(Boolean) ?? []));
  if (!skus.length) {
    return [];
  }
  return skus.map((item) => item.sku);
});

const skuFilterExpression = computed(() => {
  if (!skuCodes.value.length) {
    return "";
  }
  return `"code":"${skuCodes.value.join('","')}"`;
});

const combinedFilter = computed(() => {
  const filters = [skuFilterExpression.value, props.filter].filter(Boolean);
  return filters.join(" ");
});

const displayProducts = computed(() => {
  if (!skuCodes.value.length) {
    return products.value;
  }

  const skuOrderMap = new Map(skuCodes.value.map((sku, index) => [sku, index]));

  return [...products.value].sort((a, b) => {
    const orderA = skuOrderMap.get(a.code) ?? Number.MAX_SAFE_INTEGER;
    const orderB = skuOrderMap.get(b.code) ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
});

watchEffect(async () => {
  await fetchProducts({
    itemsPerPage: skuCodes.value.length || props.count,
    keyword: props.query,
    filter: combinedFilter.value || undefined,
  });
});
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}

.products-block {
  &.bg-neutral-800 {
    color: white;
  }
}
</style>
