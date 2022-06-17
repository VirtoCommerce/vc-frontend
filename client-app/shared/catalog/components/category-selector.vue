<template>
  <!-- category selector -->
  <VcCard :title="selectedCategory?.parent?.label">
    <template v-if="selectedCategory?.parent" #header>
      <router-link :to="'/' + selectedCategory?.parent?.slug" class="text-sm">
        <i class="fas fa-chevron-left text-[color:var(--color-primary)] cursor-pointer"></i>
        <span class="font-bold ml-2">
          {{ selectedCategory?.parent?.label }}
        </span>
      </router-link>
    </template>
    <div class="text-sm">
      <div v-if="selectedCategory?.items?.length">
        <div class="uppercase font-extrabold mb-2">{{ selectedCategory?.label }}</div>
        <div class="pl-4 flex flex-col">
          <router-link
            class="hover:bg-gray-100 pl-2"
            v-for="category in selectedCategory?.items"
            :key="category.id"
            :to="'/' + category.slug"
            >{{ category.label }}</router-link
          >
        </div>
      </div>
      <div v-else-if="selectedCategory?.parent">
        <div class="uppercase font-extrabold mb-2">{{ selectedCategory?.parent?.label }}</div>
        <div class="pl-2 flex flex-col">
          <router-link
            class="hover:bg-gray-100 pl-2"
            v-for="category in selectedCategory?.parent?.items"
            :key="category.id"
            :class="{ 'font-bold': category.id === selectedCategory.id }"
            :to="'/' + category.slug"
            >{{ category.label }}</router-link
          >
        </div>
      </div>
    </div>
  </VcCard>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { CategoryTree } from "../types";

defineProps({
  selectedCategory: {
    type: Object as PropType<CategoryTree>,
  },
});
</script>
