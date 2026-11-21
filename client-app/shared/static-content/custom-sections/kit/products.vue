<template>
  <ProductsCarousel
    v-if="view === 'carousel'"
    :query="query"
    :filter="filter"
    :count="count"
    :slides-per-view="columnCount"
  />

  <ProductsBlock
    v-else
    :query="query"
    :filter="filter"
    :count="count"
    :columns-amount-desktop="String(columnCount)"
    :columns-amount-tablet="String(Math.min(columnCount, MAX_TABLET_COLUMNS))"
  />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";

interface IProps {
  query?: string;
  filter?: string;
  take?: number;
  view?: string;
  columns?: number;
}

const props = withDefaults(defineProps<IProps>(), {
  query: undefined,
  filter: undefined,
  take: 4,
  view: "grid",
  columns: 4,
});

const MAX_TABLET_COLUMNS = 3;

const ProductsBlock = defineAsyncComponent(() => import("../../components/products-block.vue"));
const ProductsCarousel = defineAsyncComponent(() => import("../../components/products-carousel.vue"));

const count = computed(() => Math.round(props.take));
const columnCount = computed(() => Math.round(props.columns));
</script>
