<template>
  <div class="w-full bg-white columns-4 xl:columns-5 pt-3 px-10">
    <CatalogMenuCategoryBlock
      v-for="(category, index) in categories"
      :key="index"
      class="w-full min-h-[17rem] break-inside-avoid p-5"
      :class="[(index + 1) % maxRowsNumber === 0 ? 'break-after-column' : 'break-after-avoid']"
      :category="category"
      :index="index"
      :show-more-index="showMoreIndex"
      @show-more="showMoreIndex = index"
      @hide-more="showMoreIndex = undefined"
      @click-category="$emit('clickCategory')"
    ></CatalogMenuCategoryBlock>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import CatalogMenuCategoryBlock from "./catalog-menu-category-block.vue";
import { useCategories } from "@/shared/catalog";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isXL = breakpoints.smaller("xl");
const showMoreIndex = ref<number | undefined>(undefined);

const { categoryTree, loadCategoriesTree } = useCategories();

const columnsCount = computed(() => {
  return isXL.value ? 4 : 5;
});

const categories = computed(() => categoryTree.value?.items || []);

const maxRowsNumber = computed(() => {
  return Math.ceil(categories.value.length / columnsCount.value);
});

defineEmits<{ (event: "clickCategory"): void }>();

onMounted(async () => {
  await loadCategoriesTree();
});
</script>
