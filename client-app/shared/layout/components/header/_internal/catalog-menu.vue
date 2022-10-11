<template>
  <div class="w-full bg-white columns-4 xl:columns-5 pt-3 px-10">
    <CatalogMenuCategoryBlock
      v-for="(category, index) in categories"
      :key="index"
      class="w-full min-h-[15.5rem] break-inside-avoid p-5"
      :class="[(index + 1) % maxRowsNumber === 0 ? 'break-after-column' : 'break-after-avoid']"
      :category="category"
      @select="$emit('select')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import CatalogMenuCategoryBlock from "./catalog-menu-category-block.vue";
import { useCategories } from "@/shared/catalog";

defineEmits<{ (event: "select"): void }>();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isXL = breakpoints.smaller("xl");

const { categoryTree } = useCategories();

const columnsCount = computed(() => {
  return isXL.value ? 4 : 5;
});

const categories = computed(() => categoryTree.value?.items || []);

const maxRowsNumber = computed(() => {
  return Math.ceil(categories.value.length / columnsCount.value);
});
</script>
