<template>
  <!-- category selector -->
  <VcFilterCard is-header-link v-if="!loading || selectedCategory" :with-header="!!backCategory">
    <template #header>
      <router-link
        :to="backCategoryLink"
        class="flex-grow pl-0.5 text-[color:var(--color-filter-card-header)] hover:bg-gray-100"
      >
        <i class="fas fa-chevron-left text-[color:var(--color-primary)]"></i>
        <span class="font-bold ml-1.5">
          {{ backCategory?.label }}
        </span>
      </router-link>
    </template>

    <template v-if="selectedCategory">
      <div class="uppercase font-extrabold -mt-1 mb-0.5 text-13-title text-[color:var(--color-filter-card-header)]">
        <span v-if="selectedCategory.items?.length" class="block py-0.5">
          {{ category?.label }}
        </span>

        <router-link
          v-else
          :to="categoryLink"
          class="block py-0.5 px-1.5 -mx-1.5 rounded-sm hover:bg-gray-100 transition-colors"
        >
          {{ category?.label }}
        </router-link>
      </div>

      <div class="pl-5 pb-1.5 flex flex-col text-sm">
        <router-link
          v-for="(item, index) in categoryItems"
          :to="categoriesRoutes[item.id!]"
          :key="index"
          :class="{ 'font-bold': item.id === selectedCategory.id }"
          class="hover:bg-gray-100 py-0.5 px-1.5 -mx-1.5 mt-0.5 rounded-sm transition-colors truncate text-[color:var(--color-category-selector-link)]"
        >
          {{ item.label }}
        </router-link>
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

const category = computed(() =>
  selectedCategory.value?.items?.length ? selectedCategory.value : selectedCategory.value?.parent
);

const categoryLink = computed(() => (category.value ? getCategoryRoute(category.value) : undefined));

const backCategory = computed(() =>
  selectedCategory.value?.items?.length ? selectedCategory.value.parent : selectedCategory.value?.parent?.parent
);

const backCategoryLink = computed(() => (backCategory.value ? getCategoryRoute(backCategory.value) : undefined));
</script>
