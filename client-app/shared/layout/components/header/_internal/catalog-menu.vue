<template>
  <div class="w-full columns-4 bg-[color:var(--color-header-bottom-bg)] px-10 pt-3 xl:columns-5">
    <CatalogMenuCategoryBlock
      v-for="(category, index) in catalogMenuItems"
      :key="index"
      class="min-h-[15.5rem] w-full break-inside-avoid p-5"
      :class="[(index + 1) % maxRowsNumber === 0 ? 'break-after-column' : 'break-after-avoid']"
      :category="category"
      @select="$emit('select')"
    />
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed } from "vue";
import { useCatalogMenu } from "@/core/composables";
import CatalogMenuCategoryBlock from "./catalog-menu-category-block.vue";

defineEmits<{ (event: "select"): void }>();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isXL = breakpoints.smaller("xl");

const { catalogMenuItems } = useCatalogMenu();

const columnsCount = computed(() => {
  return isXL.value ? 4 : 5;
});

const maxRowsNumber = computed(() => {
  return Math.ceil(catalogMenuItems.value.length / columnsCount.value);
});
</script>
