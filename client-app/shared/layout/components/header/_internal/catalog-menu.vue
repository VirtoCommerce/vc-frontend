<template>
  <div class="w-full columns-4 bg-additional-50 px-10 pt-3 xl:columns-5">
    <CatalogMenuItem
      v-for="(item, index) in items"
      :key="index"
      :item="item"
      :class="[(index + 1) % maxRowsNumber === 0 ? 'break-after-column' : 'break-after-avoid']"
      class="min-h-[15.5rem] w-full break-inside-avoid p-5"
      @select="$emit('select')"
    />
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed } from "vue";
import CatalogMenuItem from "./catalog-menu-item.vue";
import type { ExtendedMenuLinkType } from "@/core/types";

interface IEmits {
  (event: "select"): void;
}

interface IProps {
  items: ExtendedMenuLinkType[];
}

defineEmits<IEmits>();
const props = defineProps<IProps>();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isXL = breakpoints.smaller("xl");

const columnsCount = computed(() => {
  return isXL.value ? 4 : 5;
});

const maxRowsNumber = computed(() => {
  return Math.ceil(props.items.length / columnsCount.value);
});
</script>
