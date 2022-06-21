<template>
  <!-- category selector -->
  <VcCard v-if="!loading || selectedCategory" :withHeader="!!backLabel">
    <template #header>
      <router-link :to="backTo" class="text-sm">
        <i class="fas fa-chevron-left text-[color:var(--color-primary)] cursor-pointer"></i>
        <span class="font-bold ml-2">
          {{ backLabel }}
        </span>
      </router-link>
    </template>
    <div class="text-sm">
      <div v-if="selectedCategory">
        <div class="uppercase font-extrabold mb-1">{{ categoryLabel }}</div>
        <div class="pl-2 flex flex-col">
          <router-link
            class="hover:bg-gray-100 px-2 py-0.5 mt-0.5 transition-colors"
            v-for="category in categoryItems"
            :key="category.id"
            :class="{ 'font-bold': category.id === selectedCategory.id }"
            :to="'/' + category.slug"
            >{{ category.label }}</router-link
          >
        </div>
      </div>
    </div>
  </VcCard>
  <!-- skeleton -->
  <template v-else>
    <VcCardSkeleton>
      <div class="text-sm">
        <div class="uppercase font-extrabold mb-1 bg-gray-100">&nbsp;</div>
        <div class="pl-2 flex flex-col">
          <div class="bg-gray-100 px-2 mt-1" v-for="i in 6" :key="i">&nbsp;</div>
        </div>
      </div>
    </VcCardSkeleton>
  </template>
</template>

<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { PropType, toRef } from "vue";
import { CategoryTree } from "../types";

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
  selectedCategory.value?.items?.length ? selectedCategory.value.items : selectedCategory.value?.parent?.items
);

const categoryLabel = computed(() =>
  selectedCategory.value?.items?.length ? selectedCategory.value?.label : selectedCategory.value?.parent!.label
);

const backLabel = computed(() =>
  selectedCategory.value?.items?.length
    ? selectedCategory.value.parent?.label
    : selectedCategory.value?.parent?.parent?.label
);

const backTo = computed(() => {
  const backCategorySlug = selectedCategory.value?.items?.length
    ? selectedCategory.value.parent?.slug
    : selectedCategory.value?.parent?.parent!.slug;

  return backCategorySlug ? `/${backCategorySlug}` : undefined;
});
</script>
