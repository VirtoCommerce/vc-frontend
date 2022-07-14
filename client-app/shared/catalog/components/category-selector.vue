<template>
  <!-- category selector -->
  <VcFilterCard v-if="!loading || selectedCategory" :withHeader="!!backCategory">
    <template #header>
      <router-link :to="getCategoryRoute(backCategory!)" class="mt-0.5 pl-0.5">
        <i class="fas fa-chevron-left text-[color:var(--color-primary)] cursor-pointer"></i>
        <span class="font-bold ml-1.5">
          {{ backCategory?.label }}
        </span>
      </router-link>
    </template>
    <div v-if="selectedCategory" class="text-13-title">
      <div class="uppercase font-extrabold mb-1">{{ categoryLabel }}</div>
      <div class="pl-3 flex flex-col">
        <router-link
          class="hover:bg-gray-100 px-2 py-0.5 mt-0.5 transition-colors"
          v-for="category in categoryItems"
          :key="category.id"
          :class="{ 'font-bold': category.id === selectedCategory.id }"
          :to="categoriesRoutes[category.id!]"
          >{{ category.label }}</router-link
        >
      </div>
    </div>
  </VcFilterCard>
  <!-- skeleton -->
  <template v-else>
    <VcCardSkeleton>
      <div class="uppercase font-extrabold mb-1 bg-gray-100">&nbsp;</div>
      <div class="pl-2 flex flex-col">
        <div class="bg-gray-100 px-2 mt-1" v-for="i in 6" :key="i">&nbsp;</div>
      </div>
    </VcCardSkeleton>
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
