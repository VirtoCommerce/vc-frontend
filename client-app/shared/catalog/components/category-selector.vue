<template>
  <!-- category selector -->
  <VcFilterCard v-if="!loading && displayedCategory" :with-header="!!parentCategory">
    <template #header>
      <router-link
        :to="parentCategory?.route!"
        class="grow py-0.5 px-1.5 -mx-1.5 rounded-sm text-[color:var(--color-filter-card-header)] hover:bg-gray-100"
      >
        <i class="fas fa-chevron-left text-[color:var(--color-primary)]"></i>
        <span class="font-bold ml-1.5">
          {{ parentCategory?.title }}
        </span>
      </router-link>
    </template>

    <div v-if="subcategories.length">
      <div class="uppercase font-extrabold -mt-1 mb-0.5 text-13-title text-[color:var(--color-filter-card-header)]">
        <span v-if="subcategories.length" class="block py-0.5">
          {{ displayedCategory.title }}
        </span>

        <router-link
          v-else
          :to="displayedCategory.route!"
          class="block py-0.5 px-2 -mx-2 rounded-sm hover:bg-gray-100 transition-colors"
        >
          {{ displayedCategory.title }}
        </router-link>
      </div>

      <div class="pl-4 flex flex-col text-sm">
        <router-link
          v-for="item in subcategories"
          :to="item.route!"
          :key="item.id"
          :class="{ 'font-bold': item.id === selectedCategory?.id }"
          class="hover:bg-gray-100 py-0.5 px-2 -mx-2 mt-0.5 rounded-sm transition-colors truncate text-[color:var(--color-category-selector-link)]"
        >
          {{ item.title }}
        </router-link>
      </div>
    </div>
  </VcFilterCard>

  <!-- skeleton -->
  <VcFilterCardSkeleton v-else-if="loading">
    <div class="h-5 mb-1.5 bg-gray-100">&nbsp;</div>
    <div class="ml-6 mb-1.5 h-4 bg-gray-100" v-for="i in 6" :key="i">&nbsp;</div>
  </VcFilterCardSkeleton>
</template>

<script setup lang="ts">
import { Category } from "@/xapi";
import { useCategorySelector } from "@/core";
import { watchEffect } from "vue";

interface Props {
  selectedCategory?: Category;
  loading: boolean;
}

const props = defineProps<Props>();

const { displayedCategory, parentCategory, subcategories, initCategorySelector } = useCategorySelector();

watchEffect(() => initCategorySelector(props.selectedCategory));
</script>
