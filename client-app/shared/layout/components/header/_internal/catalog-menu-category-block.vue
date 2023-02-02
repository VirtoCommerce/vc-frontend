<template>
  <div>
    <router-link
      class="block px-2 py-1 mb-2 text-base font-bold hover:bg-gray-100"
      :to="menuItem.route!"
      :title="menuItem.title!"
      @click="clickCategory"
    >
      {{ menuItem.title }}
    </router-link>
    <div>
      <template v-for="(item, index) in displayedItems" :key="index">
        <router-link
          class="block px-2 py-1 mb-1 text-sm !leading-4 text-gray-500 truncate hover:bg-gray-100"
          :to="item.route!"
          :title="item.title!"
          @click="clickCategory"
        >
          {{ item.title }}
        </router-link>
      </template>

      <button
        v-if="subItems.length > SHORT_VIEW_ITEMS_COUNT"
        class="px-2 py-1 text-sm cursor-pointer flex items-baseline"
        @click="toggleShowAll"
      >
        <span
          class="text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]"
          v-t="
            showAll
              ? 'shared.layout.header.bottom_header.catalog_menu.hide_more'
              : 'shared.layout.header.bottom_header.catalog_menu.show_more'
          "
        />
        <i
          class="ml-[5px] fas text-[color:var(--color-primary)]"
          :class="[showAll ? 'fa-chevron-up' : 'fa-chevron-down']"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { MenuLink } from "@/core";

const SHORT_VIEW_ITEMS_COUNT = 5;
const showAll = ref(false);

interface Props {
  menuItem: MenuLink;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (event: "select"): void;
}>();

const subItems = computed<MenuLink[]>(() => props.menuItem.children || []);
const displayedItems = computed<MenuLink[]>(() =>
  showAll.value ? subItems.value : subItems.value.slice(0, SHORT_VIEW_ITEMS_COUNT)
);

function toggleShowAll() {
  showAll.value = !showAll.value;
}

function clickCategory() {
  emit("select");
}
</script>
