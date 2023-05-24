<template>
  <VcFilterCardSkeleton v-if="loading">
    <div class="mb-1.5 h-5 bg-gray-100">&nbsp;</div>
    <div v-for="i in 6" :key="i" class="mb-1.5 ml-6 h-4 bg-gray-100">&nbsp;</div>
  </VcFilterCardSkeleton>

  <VcFilterCard v-else :with-header="!!parentCategory" :full-width-content="!category?.childCategories?.length">
    <template #header>
      <router-link
        :to="getCategoryRoute(parentCategory!)"
        class="-mx-1.5 grow rounded-sm px-1.5 py-0.5 text-[color:var(--color-filter-card-header)] hover:bg-gray-100"
      >
        <i class="fas fa-chevron-left text-[color:var(--color-primary)]"></i>
        <span class="ml-1.5 font-bold">
          {{ parentCategory!.name }}
        </span>
      </router-link>
    </template>

    <template v-if="category?.childCategories?.length" #default>
      <div
        class="-mt-1 mb-0.5 py-0.5 text-13-title font-extrabold uppercase text-[color:var(--color-filter-card-header)]"
      >
        {{ category?.name }}
      </div>

      <div class="flex flex-col pl-4 text-sm">
        <router-link
          v-for="(item, index) in subcategories"
          :key="index"
          :to="subcategoriesRoutes[item.id]"
          class="-mx-2 mt-0.5 truncate rounded-sm px-2 py-0.5 text-[color:var(--color-category-selector-link)] transition-colors hover:bg-gray-100"
        >
          {{ item.name }}
        </router-link>
      </div>
    </template>
  </VcFilterCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCategoriesRoutes } from "@/core/composables";
import { getCategoryRoute } from "@/core/utilities";
import type { Category } from "@/xapi/types";

interface IProps {
  category?: Category | null;
  loading?: boolean;
}

const props = defineProps<IProps>();

const parentCategory = computed<Category | undefined>(() => props.category?.parent);
const subcategories = computed<Category[]>(() => props.category?.childCategories || []);

const subcategoriesRoutes = useCategoriesRoutes(subcategories);
</script>
