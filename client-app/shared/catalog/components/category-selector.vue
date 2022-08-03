<template>
  <!-- category selector -->
  <VcFilterCard v-if="!loading || selectedCategory" :withHeader="!!backCategory">
    <template #header>
      <router-link :to="getCategoryRoute(backCategory!)" class="pl-0.5">
        <i class="fas fa-chevron-left text-[color:var(--color-primary)]"></i>
        <span class="font-bold ml-1.5">
          {{ backCategory?.label }}
        </span>
      </router-link>
    </template>
    <template v-if="selectedCategory">
      <div class="uppercase font-extrabold -mt-0.5 mb-1 text-13-title">{{ categoryLabel }}</div>
      <div class="-mr-1.5 pl-5 pb-1.5 flex flex-col text-sm">
        <router-link
          class="hover:bg-gray-100 py-0.5 mt-0.5 transition-colors truncate"
          v-for="category in categoryItems"
          :key="category.id"
          :class="{ 'font-bold': category.id === selectedCategory.id }"
          :to="categoriesRoutes[category.id!]"
          >{{ category.label }}</router-link
        >
      </div>
    </template>
  </VcFilterCard>
  <!-- skeleton -->
  <template v-else>
    <VcFilterCardSkeleton>
      <div class="h-5 mb-1.5 bg-gray-100">&nbsp;</div>
      <div class="ml-6 mb-1.5 h-4 bg-gray-100" v-for="i in 6" :key="i">&nbsp;</div>
    </VcFilterCardSkeleton>
  </template>
</template>

<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { PropType, toRef } from "vue";
import { CategoryTree, useCategoriesRoutes, getCategoryRoute } from "@/shared/catalog";

const props = defineProps({
  selectedCategory: {
    type: Object as PropType<CategoryTree>,
    required: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const selectedCategory = toRef(props, "selectedCategory");

const categoryItems = computed(() =>
  selectedCategory.value?.items?.length ? selectedCategory.value.items : selectedCategory.value?.parent?.items || []
);

const categoriesRoutes = useCategoriesRoutes(categoryItems);

const categoryLabel = computed(() =>
  selectedCategory.value?.items?.length ? selectedCategory.value?.label : selectedCategory.value?.parent!.label
);

const backCategory = computed(() =>
  selectedCategory.value?.items?.length ? selectedCategory.value.parent : selectedCategory.value?.parent?.parent
);
</script>
