<template>
  <!-- Mobile table view -->
  <template v-if="isMobile && $slots['mobile-item']">
    <!-- Mobile skeleton view -->
    <div v-if="loading">
      <slot name="mobile-skeleton" />
    </div>

    <!-- Mobile empty view -->
    <div v-else-if="!items.length">
      <slot name="mobile-empty" />
    </div>

    <!-- Mobile item view -->
    <div v-else class="overflow-x-hidden">
      <VcSlidingActions
        v-for="item in items"
        :key="item.id"
        :input-object="item"
        :actions-builder="itemActionsBuilder"
        @click="$emit('itemClick', item)"
      >
        <slot name="mobile-item" :item="item" />
      </VcSlidingActions>
    </div>
  </template>

  <!-- Desktop table view -->
  <table v-else :class="[layout, 'text-sm text-left w-full']">
    <thead v-if="columns.length" class="border-b border-gray-200">
      <tr>
        <th
          v-for="column in columns"
          :key="column.id"
          class="py-3 px-5 font-extrabold"
          :class="[{ 'cursor-pointer': column.sortable }, `text-${column.align || 'left'}`, column.classes]"
          @click="
            column.sortable
              ? $emit('headerClick', { column: column.id, direction: toggleSortDirection(sort!.direction) })
              : null
          "
        >
          {{ column.title }}
          <template v-if="column.sortable && sort">
            <i
              v-if="sort.column === column.id && sort.direction === SORT_DESCENDING"
              class="fas fa-caret-down ml-2"
            ></i>
            <i v-if="sort.column === column.id && sort.direction === SORT_ASCENDING" class="fas fa-caret-up ml-2"></i>
          </template>
        </th>
      </tr>
    </thead>

    <!-- Desktop skeleton view -->
    <tbody v-if="loading">
      <slot name="desktop-skeleton" />
    </tbody>

    <!-- Desktop empty view -->
    <tbody v-else-if="!items.length">
      <slot name="desktop-empty" />
    </tbody>

    <!-- Desktop table view -->
    <tbody v-else>
      <slot name="desktop-body" />
    </tbody>
  </table>

  <!-- Table footer -->
  <slot v-if="($slots['footer'] || footer) && items && items.length" name="footer">
    <!-- Table pagination -->
    <VcPagination
      v-if="pages > 1"
      :page="page"
      :pages="pages"
      class="self-start"
      :class="[isMobile ? 'px-6 py-10' : 'pb-5 px-5 mt-5']"
      @update:page="onPageUpdate"
    ></VcPagination>
  </slot>
</template>

<script setup lang="ts">
import { toggleSortDirection } from "@/core";
import { ISortInfo } from "@/core/types";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { SORT_ASCENDING, SORT_DESCENDING } from "@/core/constants";
import { PropType } from "vue";

defineProps({
  columns: {
    type: Array as PropType<ITableColumn[]>,
    default: () => [],
  },

  items: {
    type: Array as PropType<any[]>,
    default: () => [],
  },

  itemActionsBuilder: {
    type: Function as PropType<(inputObject: any) => SlidingActionsItem[]>,
    default: undefined,
  },

  sort: {
    type: Object as PropType<ISortInfo>,
    default: undefined,
  },

  pages: {
    type: Number,
    default: 0,
  },

  page: {
    type: Number,
    default: 0,
  },

  loading: {
    type: Boolean,
    default: false,
  },

  footer: {
    type: Boolean,
    default: true,
  },

  layout: {
    type: String,
    default: "table-fixed",
  },
});

const emit = defineEmits(["itemClick", "headerClick", "pageChanged"]);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

const onPageUpdate = (newPage: number) => {
  emit("pageChanged", newPage);
};
</script>
