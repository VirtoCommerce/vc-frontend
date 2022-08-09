<template>
  <div class="w-full bg-white columns-4 xl:columns-5 px-10">
    <CatalogMenuCategoryBlock
      v-for="(category, index) in categories"
      :key="index"
      class="w-full min-h-[13rem] break-inside-avoid p-5"
      :class="[(index + 1) % maxRowsNumber === 0 ? 'break-after-column' : 'break-after-avoid']"
      :category="category"
      :index="index"
      :show-more-index="showMoreIndex"
      @show-more="showMoreIndex = index"
      @hide-more="showMoreIndex = undefined"
    ></CatalogMenuCategoryBlock>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import CatalogMenuCategoryBlock from "./catalog-menu-category-block.vue";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isXL = breakpoints.smaller("xl");
const showMoreIndex = ref<number | undefined>(undefined);

const columnsCount = computed(() => {
  return isXL.value ? 4 : 5;
});

const categories = ref([
  {
    name: "Category 1",
    sub: [
      {
        name: "Subcategory 1",
      },
      {
        name: "Subcategory 2",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
      {
        name: "Subcategory 5",
      },
      {
        name: "Subcategory 6",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
      {
        name: "Subcategory 5",
      },
      {
        name: "Subcategory 6",
      },
      {
        name: "Subcategory 6",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
      {
        name: "Subcategory 5",
      },
      {
        name: "Subcategory 6",
      },
    ],
  },
  {
    name: "Category 2",
    sub: [
      {
        name: "Subcategory 1",
      },
      {
        name: "Subcategory 2",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
      {
        name: "Subcategory 5",
      },
      {
        name: "Subcategory 6",
      },
    ],
  },
  {
    name: "Category 3",
    sub: [
      {
        name: "Subcategory 1",
      },
      {
        name: "Subcategory 2",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
      {
        name: "Subcategory 5",
      },
      {
        name: "Subcategory 6",
      },
    ],
  },
  {
    name: "Category 4",
    sub: [
      {
        name: "Subcategory 1",
      },
      {
        name: "Subcategory 2",
      },
      {
        name: "Subcategory 3",
      },
    ],
  },
  {
    name: "Category 5",
    sub: [
      {
        name: "Subcategory 1",
      },
      {
        name: "Subcategory 6",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
      {
        name: "Subcategory 5",
      },
      {
        name: "Subcategory 6",
      },
      {
        name: "Subcategory 2",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
      {
        name: "Subcategory 6",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
      {
        name: "Subcategory 5",
      },
      {
        name: "Subcategory 6",
      },
      {
        name: "Subcategory 5",
      },
      {
        name: "Subcategory 6",
      },
      {
        name: "Subcategory 1",
      },
      {
        name: "Subcategory 6",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
      {
        name: "Subcategory 5",
      },
      {
        name: "Subcategory 6",
      },
      {
        name: "Subcategory 2",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
      {
        name: "Subcategory 6",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
      {
        name: "Subcategory 5",
      },
      {
        name: "Subcategory 6",
      },
      {
        name: "Subcategory 5",
      },
      {
        name: "Subcategory 6",
      },
    ],
  },
  {
    name: "Category 6",
    sub: [
      {
        name: "Subcategory 1",
      },
      {
        name: "Subcategory 2",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
      {
        name: "Subcategory 5",
      },
      {
        name: "Subcategory 6",
      },
    ],
  },
  {
    name: "Category 7",
    sub: [
      {
        name: "Subcategory 1",
      },
      {
        name: "Subcategory 2",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
      {
        name: "Subcategory 5",
      },
      {
        name: "Subcategory 6",
      },
    ],
  },
  {
    name: "Category 8",
    sub: [
      {
        name: "Subcategory 1",
      },
      {
        name: "Subcategory 2",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
    ],
  },
  {
    name: "Category 9",
    sub: [
      {
        name: "Subcategory 1",
      },
      {
        name: "Subcategory 2",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
      {
        name: "Subcategory 5",
      },
      {
        name: "Subcategory 6",
      },
    ],
  },
  {
    name: "Category 10",
    sub: [
      {
        name: "Subcategory 1",
      },
      {
        name: "Subcategory 2",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
      {
        name: "Subcategory 5",
      },
      {
        name: "Subcategory 6",
      },
      {
        name: "Subcategory 1",
      },
      {
        name: "Subcategory 2",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
      {
        name: "Subcategory 5",
      },
      {
        name: "Subcategory 6",
      },
      {
        name: "Subcategory 1",
      },
      {
        name: "Subcategory 2",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
      {
        name: "Subcategory 5",
      },
      {
        name: "Subcategory 6",
      },
    ],
  },
  {
    name: "Category 11",
    sub: [
      {
        name: "Subcategory 1",
      },
      {
        name: "Subcategory 2",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
      {
        name: "Subcategory 5",
      },
      {
        name: "Subcategory 6",
      },
    ],
  },
  {
    name: "Category 12",
    sub: [
      {
        name: "Subcategory 1",
      },
      {
        name: "Subcategory 2",
      },
    ],
  },
  {
    name: "Category 13",
    sub: [
      {
        name: "Subcategory 1",
      },
      {
        name: "Subcategory 2",
      },
      {
        name: "Subcategory 3",
      },
      {
        name: "Subcategory 4",
      },
    ],
  },
]);

const maxRowsNumber = computed(() => {
  return Math.ceil(categories.value.length / columnsCount.value);
});
</script>
