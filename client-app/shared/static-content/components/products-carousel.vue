<template>
  <div class="products-carousel py-10 lg:py-24" :class="background">
    <div class="mx-auto w-full max-w-screen-xl px-5 md:px-12">
      <VcTypography v-if="title" tag="h2" variant="h1" class="mb-2 text-center lg:mb-4">
        {{ title }}
      </VcTypography>

      <div v-if="subtitle" class="mb-8 text-center lg:text-lg">{{ subtitle }}</div>

      <VcCarousel v-if="displayProducts.length" :slides="displayProducts" :options="carouselOptions" navigation>
        <template #slide="{ slide: product }">
          <div class="h-full p-3">
            <ProductCard class="h-full" :card-type="cardType" :product="product" />
          </div>
        </template>
      </VcCarousel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { BREAKPOINTS } from "@/core/constants";
import { extractNumberFromString } from "@/core/utilities";
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
  slidesPerView?: number;
  skus?: Array<{ sku: string }>;
}

const props = withDefaults(defineProps<IProps>(), {
  cardType: "full",
  count: 8,
  slidesPerView: 4,
  skus: () => [],
});

const { products, fetchProducts } = useProducts();

const xsScreenWidth = extractNumberFromString(BREAKPOINTS.xs);
const smScreenWidth = extractNumberFromString(BREAKPOINTS.sm);
const mdScreenWidth = extractNumberFromString(BREAKPOINTS.md);
const lgScreenWidth = extractNumberFromString(BREAKPOINTS.lg);

const skuCodes = computed(() => {
  if (!props.skus?.length) {
    return [];
  }
  return props.skus.map((item) => item.sku).filter(Boolean);
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

const carouselOptions = computed<ICarouselOptions>(() => ({
  slidesPerView: 1.5,
  spaceBetween: 12,
  breakpoints: {
    [xsScreenWidth]: {
      slidesPerView: 2,
      spaceBetween: 12,
    },
    [smScreenWidth]: {
      slidesPerView: 3,
      spaceBetween: 16,
    },
    [mdScreenWidth]: {
      slidesPerView: Math.min(props.slidesPerView, 3),
      spaceBetween: 16,
    },
    [lgScreenWidth]: {
      slidesPerView: props.slidesPerView,
      spaceBetween: 16,
    },
  },
}));

watchEffect(async () => {
  if (skuCodes.value.length > 0) {
    await fetchProducts({
      itemsPerPage: skuCodes.value.length,
      filter: combinedFilter.value,
    });
  } else {
    await fetchProducts({
      itemsPerPage: props.count,
      keyword: props.query,
      filter: props.filter,
    });
  }
});
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}

.products-carousel {
  &.bg-neutral-800 {
    color: white;
  }
}
</style>
