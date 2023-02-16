<template>
  <div>
    <router-link
      class="mb-2 block px-2 py-1 text-base font-bold hover:bg-gray-100"
      :to="categoriesRoutes[category.id]"
      :title="category.name"
      @click="clickCategory"
    >
      {{ category.name }}
    </router-link>
    <div>
      <template v-for="(subcategory, key) in displayedCategories" :key="key">
        <router-link
          class="mb-1 block truncate px-2 py-1 text-sm !leading-4 text-gray-500 hover:bg-gray-100"
          :to="categoriesRoutes[subcategory.id]"
          :title="subcategory.name"
          @click="clickCategory"
        >
          {{ subcategory.name }}
        </router-link>
      </template>

      <button
        v-if="subcategories.length > SHORT_VIEW_ITEMS_COUNT"
        class="flex cursor-pointer items-baseline px-2 py-1 text-sm"
        @click="toggleShowAll"
      >
        <span
          v-t="
            showAll
              ? 'shared.layout.header.bottom_header.catalog_menu.hide_more'
              : 'shared.layout.header.bottom_header.catalog_menu.show_more'
          "
          class="text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]"
        />
        <i
          class="fas ml-[5px] text-[color:var(--color-primary)]"
          :class="[showAll ? 'fa-chevron-up' : 'fa-chevron-down']"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType, ref } from "vue";
import { useCategoriesRoutes } from "@/core";
import { Category } from "@/xapi";

const emit = defineEmits<{
  (event: "select"): void;
}>();
const props = defineProps({
  category: {
    type: Object as PropType<Category>,
    required: true,
  },
});
const SHORT_VIEW_ITEMS_COUNT = 5;
const showAll = ref(false);

const subcategories = computed<Category[]>(() => props.category.childCategories || []);
const displayedCategories = computed<Category[]>(() =>
  showAll.value ? subcategories.value : subcategories.value.slice(0, SHORT_VIEW_ITEMS_COUNT)
);

const categoriesRoutes = useCategoriesRoutes(computed(() => [props.category].concat(subcategories.value)));

function toggleShowAll() {
  showAll.value = !showAll.value;
}

function clickCategory() {
  emit("select");
}
</script>
