<template>
  <div ref="menuContainer" class="w-full columns-4 px-10 pt-3 xl:columns-5">
    <CatalogMenuItem
      v-for="(item, index) in items"
      :key="index"
      :item="item"
      :class="[(index + 1) % maxRowsNumber === 0 ? 'break-after-column' : 'break-after-avoid']"
      class="min-h-[15.5rem] w-full break-inside-avoid p-5"
      tabindex="-1"
      @select="$emit('select')"
      @keydown.esc="$emit('close')"
      @focusout="handleFocusOut"
    />
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed, ref } from "vue";
import CatalogMenuItem from "./catalog-menu-item.vue";
import type { ExtendedMenuLinkType } from "@/core/types";

interface IEmits {
  (event: "select"): void;
  (event: "close"): void;
  (event: "focusout", payload: FocusEvent): void;
}

interface IProps {
  items: ExtendedMenuLinkType[];
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isXL = breakpoints.smaller("xl");

const columnsCount = computed(() => {
  return isXL.value ? 4 : 5;
});

const maxRowsNumber = computed(() => {
  return Math.ceil(props.items.length / columnsCount.value);
});

const menuContainer = ref<HTMLElement | null>(null);

const handleFocusOut = (event: FocusEvent) => {
  // if focus moved outside of the menu, close the menu
  if (!menuContainer.value?.contains(event.relatedTarget as Node)) {
    emit("focusout", event);
  }
};
</script>
