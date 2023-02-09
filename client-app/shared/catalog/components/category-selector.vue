<template>
  <!-- category selector -->
  <VcFilterCard v-if="displayedCategory" :with-header="!!backCategory">
    <template #header>
      <router-link
        :to="getCategoryRoute(backCategory!)"
        class="grow py-0.5 px-1.5 -mx-1.5 rounded-sm text-[color:var(--color-filter-card-header)] hover:bg-gray-100"
      >
        <i class="fas fa-chevron-left text-[color:var(--color-primary)]"></i>
        <span class="font-bold ml-1.5">
          {{ backCategory?.name }}
        </span>
      </router-link>
    </template>

    <div class="uppercase font-extrabold -mt-1 mb-0.5 text-13-title text-[color:var(--color-filter-card-header)]">
      <span v-if="selectedCategory?.children.length" class="block py-0.5">
        {{ displayedCategory?.name }}
      </span>

      <router-link
        v-else
        :to="getCategoryRoute(displayedCategory)"
        class="block py-0.5 px-2 -mx-2 rounded-sm hover:bg-gray-100 transition-colors"
      >
        {{ displayedCategory?.name }}
      </router-link>
    </div>

    <div class="pl-4 flex flex-col text-sm">
      <router-link
        v-for="(item, index) in subcategories"
        :key="index"
        :to="subcategoriesRoutes[item.id]"
        :class="{ 'font-bold': item.id === selectedCategory?.id }"
        class="hover:bg-gray-100 py-0.5 px-2 -mx-2 mt-0.5 rounded-sm transition-colors truncate text-[color:var(--color-category-selector-link)]"
      >
        {{ item.name }}
      </router-link>
    </div>
  </VcFilterCard>

  <!-- skeleton -->
  <VcFilterCardSkeleton v-else-if="loading">
    <div class="h-5 mb-1.5 bg-gray-100">&nbsp;</div>
    <div v-for="i in 6" :key="i" class="ml-6 mb-1.5 h-4 bg-gray-100">&nbsp;</div>
  </VcFilterCardSkeleton>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { CategoryTreeItem, getCategoryRoute, useCategoriesRoutes } from "@/core";

const props = defineProps({
  selectedCategory: {
    type: Object as PropType<CategoryTreeItem>,
    required: false,
  },

  loading: {
    type: Boolean,
    default: false,
  },
});

const displayedCategory = computed<CategoryTreeItem | undefined>(() =>
  props.selectedCategory?.children.length ? props.selectedCategory : props.selectedCategory?.parent
);
const backCategory = computed<CategoryTreeItem | undefined>(() => displayedCategory.value?.parent);
const subcategories = computed<CategoryTreeItem[]>(() => displayedCategory.value?.children || []);

const subcategoriesRoutes = useCategoriesRoutes(subcategories);
</script>
