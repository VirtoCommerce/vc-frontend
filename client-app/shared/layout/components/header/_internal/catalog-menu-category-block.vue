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
    <div>
      <template v-for="(subcategory, key) in displayedCategories" :key="key">
        <router-link
          class="block px-2 py-1 mb-1 text-sm !leading-4 text-gray-500 truncate hover:bg-gray-100"
          :to="categoriesRoutes[subcategory.id!]"
          :title="subcategory.label"
          @click="clickCategory"
        >
          {{ subcategory.label }}
        </router-link>
      </template>

      <template v-if="subCategories.length > SHORT_VIEW_ITEMS_COUNT">
        <div v-show="!showAll" @click="clickShowMore" class="px-2 py-1 text-sm cursor-pointer flex items-baseline">
          <span
            class="text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]"
            v-t="'shared.layout.header.bottom_header.catalog_menu.show_more'"
          ></span>
          <i class="ml-[5px] fas fa-chevron-down text-[color:var(--color-primary)]"></i>
        </div>
        <div v-show="showAll" @click="clickHideMore" class="px-2 py-1 text-sm cursor-pointer flex items-baseline">
          <span
            class="text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]"
            v-t="'shared.layout.header.bottom_header.catalog_menu.hide_more'"
          ></span>
          <i class="ml-[5px] fas fa-chevron-up text-[color:var(--color-primary)]"></i>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CategoryTree, useCategoriesRoutes } from "@/shared/catalog";
import { computed, PropType, ref } from "vue";

const SHORT_VIEW_ITEMS_COUNT = 5;
const showAll = ref(false);

const props = defineProps({
  category: {
    type: Object as PropType<CategoryTree>,
    required: true,
  },
});

const emit = defineEmits<{
  (event: "select"): void;
}>();

const subCategories = computed(() => props.category.items || []);

const displayedCategories = computed(() =>
  showAll.value ? subCategories.value : subCategories.value.slice(0, SHORT_VIEW_ITEMS_COUNT)
);

const categoryWithSubcategories = computed(() => [props.category, ...(props.category.items || [])]);

const categoriesRoutes = useCategoriesRoutes(categoryWithSubcategories);

function clickShowMore() {
  showAll.value = true;
}

function clickHideMore() {
  showAll.value = false;
}

function clickCategory() {
  emit("select");
}
</script>
