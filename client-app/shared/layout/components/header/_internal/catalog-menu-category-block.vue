<template>
  <div>
    <router-link
      class="block px-2 py-1 mb-2 text-base font-bold hover:bg-gray-100"
      :to="categoriesRoutes[category.id!]"
      :title="category.label"
      @click="clickCategory"
    >
      {{ category.label }}
    </router-link>
    <div v-if="category.items">
      <template v-for="(subcategory, key) in category.items" :key="key">
        <router-link
          v-if="(showMoreIndex !== index && key < 5) || showMoreIndex === index"
          class="block px-2 py-1 mb-1 text-sm !leading-4 text-gray-500 truncate hover:bg-gray-100"
          :to="categoriesRoutes[subcategory.id!]"
          :title="subcategory.label"
          @click="clickCategory"
        >
          {{ subcategory.label }}
        </router-link>
      </template>

      <div
        v-if="category.items.length > 5 && showMoreIndex !== index"
        @click="clickShowMore"
        class="px-2 py-1 text-sm cursor-pointer flex items-baseline"
      >
        <span class="text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]"> Show more </span>
        <i class="ml-[5px] fas fa-chevron-down text-[color:var(--color-primary)]"></i>
      </div>
      <div
        v-if="category.items.length > 5 && showMoreIndex === index"
        @click="clickHideMore"
        class="px-2 py-1 text-sm cursor-pointer flex items-baseline"
      >
        <span class="text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]"> Hide </span>
        <i class="ml-[5px] fas fa-chevron-up text-[color:var(--color-primary)]"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CategoryTree, useCategoriesRoutes } from "@/shared/catalog";
import { computed, PropType } from "vue";

const props = defineProps({
  category: {
    type: Object as PropType<CategoryTree>,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  showMoreIndex: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits<{
  (event: "showMore", categoryMenuIndex: number): void;
  (event: "hideMore"): void;
  (event: "clickCategory"): void;
}>();

function clickShowMore() {
  emit("showMore", props.index);
}

function clickHideMore() {
  emit("hideMore");
}

function clickCategory() {
  emit("clickCategory");
}

const categoryWithSubcategories = computed(() => [props.category, ...(props.category.items || [])]);

const categoriesRoutes = useCategoriesRoutes(categoryWithSubcategories);
</script>
