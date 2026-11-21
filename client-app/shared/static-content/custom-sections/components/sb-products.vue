<template>
  <div
    v-track-item="products"
    class="sb-products"
    data-vc-track="product-list"
    data-list-id="custom_section_products"
    :data-list-name="query"
  >
    <VcCarousel v-if="view === 'carousel'" :slides="products" :options="carouselOptions" navigation>
      <template #slide="{ slide: product }">
        <div class="sb-products__slide">
          <ProductCard class="sb-products__card" :product="product" />
        </div>
      </template>
    </VcCarousel>

    <div v-else class="sb-products__grid" :style="{ '--columns': columnCount }">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { extractNumberFromString } from "@/core/utilities";
import { ProductCard, useProducts } from "@/shared/catalog";
import { BREAKPOINTS } from "@/ui-kit/constants";
import type { ProductViewType } from "../kit/constants";

interface IProps {
  query?: string;
  filter?: string;
  take?: number;
  view?: ProductViewType;
  columns?: number;
}

const props = withDefaults(defineProps<IProps>(), {
  query: undefined,
  filter: undefined,
  take: 4,
  view: "grid",
  columns: 4,
});

/** Slides at the narrowest, so the next one peeks in. */
const NARROW_SLIDES = 1.5;

const { products, fetchProducts } = useProducts();

const count = computed(() => Math.round(props.take));
const columnCount = computed(() => Math.round(props.columns));

/** Measured on the container, never above `columns`. */
const carouselOptions = computed<ICarouselOptions>(() => {
  const steps: [string, number][] = [
    [BREAKPOINTS.xs, 2],
    [BREAKPOINTS.sm, 3],
    [BREAKPOINTS.lg, columnCount.value],
  ];

  return {
    slidesPerView: Math.min(NARROW_SLIDES, columnCount.value),
    breakpointsBase: "container",
    breakpoints: Object.fromEntries(
      steps.map(([width, slides]) => [
        extractNumberFromString(width),
        { slidesPerView: Math.min(slides, columnCount.value) },
      ]),
    ),
  };
});

watchEffect(async () => {
  await fetchProducts({ itemsPerPage: count.value, keyword: props.query, filter: props.filter });
});
</script>

<style lang="scss">
// The section around it sets the width, the spacing and the heading.
.sb-products {
  &__grid {
    // The narrowest card before the row drops a column; `--columns` is the most the row holds.
    --min-card-width: 10rem;
    --gap: theme("spacing.6");

    @apply grid gap-[--gap];

    grid-template-columns: repeat(
      auto-fill,
      minmax(max(var(--min-card-width), calc((100% - (var(--columns) - 1) * var(--gap)) / var(--columns))), 1fr)
    );
  }

  &__slide {
    @apply h-full p-3;
  }

  &__card {
    @apply h-full;
  }
}
</style>
