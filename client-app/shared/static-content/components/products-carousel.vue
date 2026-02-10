<template>
  <div class="products-carousel" :class="background">
    <div class="products-carousel__wrapper">
      <VcTypography v-if="title" tag="h2" variant="h1" class="products-carousel__title">
        {{ title }}
      </VcTypography>

      <div v-if="subtitle" class="products-carousel__subtitle">{{ subtitle }}</div>

      <VcCarousel v-if="displayProducts.length" :slides="displayProducts" :options="carouselOptions" navigation>
        <template #slide="{ slide: product }">
          <div class="products-carousel__slide">
            <ProductCard class="products-carousel__card" :card-type="cardType" :product="product" />
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
  const skus = Array.from(new Set(props.skus?.map((item) => item.sku)?.filter(Boolean) ?? []));
  if (!skus.length) {
    return [];
  }
  return skus;
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
  breakpoints: {
    [xsScreenWidth]: {
      slidesPerView: 2,
    },
    [smScreenWidth]: {
      slidesPerView: 3,
    },
    [mdScreenWidth]: {
      slidesPerView: Math.min(props.slidesPerView, 3),
    },
    [lgScreenWidth]: {
      slidesPerView: props.slidesPerView,
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
.products-carousel {
  @apply py-10 lg:py-24;

  &.bg-neutral-800 {
    @apply text-additional-50;
  }

  &__wrapper {
    @apply mx-auto w-full max-w-screen-xl px-5 md:px-12;
  }

  &__title {
    @apply mb-2 text-center lg:mb-4 normal-case;
  }

  &__subtitle {
    @apply mb-8 text-center lg:text-lg;
  }

  &__slide {
    @apply h-full p-3;
  }

  &__card {
    @apply h-full;
  }
}
</style>
