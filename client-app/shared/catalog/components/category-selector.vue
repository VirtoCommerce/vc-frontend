<template>
  <!-- category selector -->
  <VcFilterCard v-if="displayedCategory" :with-header="!!backCategory">
    <template #header>
      <router-link
        :to="getCategoryRoute(backCategory!)"
        class="-mx-1.5 grow rounded-sm py-0.5 px-1.5 text-[color:var(--color-filter-card-header)] hover:bg-gray-100"
      >
        <i class="fas fa-chevron-left text-[color:var(--color-primary)]"></i>
        <span class="ml-1.5 font-bold">
          {{ backCategory?.name }}
        </span>
      </router-link>
    </template>

    <div class="-mt-1 mb-0.5 text-13-title font-extrabold uppercase text-[color:var(--color-filter-card-header)]">
      <span v-if="selectedCategory?.children.length" class="block py-0.5">
        {{ displayedCategory?.name }}
      </span>

      <router-link
        v-else
        :to="getCategoryRoute(displayedCategory)"
        class="-mx-2 block rounded-sm py-0.5 px-2 transition-colors hover:bg-gray-100"
      >
        {{ displayedCategory?.name }}
      </router-link>
    </div>

    <div class="flex flex-col pl-4 text-sm">
      <router-link
        v-for="(item, index) in subcategories"
        :key="index"
        :to="subcategoriesRoutes[item.id]"
        :class="{ 'font-bold': item.id === selectedCategory?.id }"
        class="-mx-2 mt-0.5 truncate rounded-sm py-0.5 px-2 text-[color:var(--color-category-selector-link)] transition-colors hover:bg-gray-100"
      >
        {{ item.name }}
      </router-link>
    </div>
  </VcFilterCard>

  <!-- skeleton -->
  <VcFilterCardSkeleton v-else-if="loading">
    <div class="mb-1.5 h-5 bg-gray-100">&nbsp;</div>
    <div v-for="i in 6" :key="i" class="ml-6 mb-1.5 h-4 bg-gray-100">&nbsp;</div>
  </VcFilterCardSkeleton>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCategoriesRoutes } from "@/core/composables";
import { getCategoryRoute } from "@/core/utilities";
import type { CategoryTreeItemType } from "@/core/types";
import type { PropType } from "vue";

const props = defineProps({
  selectedCategory: {
    type: Object as PropType<CategoryTreeItemType>,
    required: false,
  },

  loading: {
    type: Boolean,
    default: false,
  },
});

const displayedCategory = computed<CategoryTreeItemType | undefined>(() =>
  props.selectedCategory?.children.length ? props.selectedCategory : props.selectedCategory?.parent
);
const backCategory = computed<CategoryTreeItemType | undefined>(() => displayedCategory.value?.parent);
const subcategories = computed<CategoryTreeItemType[]>(() => displayedCategory.value?.children || []);

const subcategoriesRoutes = useCategoriesRoutes(subcategories);
</script>
