<template>
  <!-- Mobile table view -->
  <template v-if="isMobile && $slots['mobile-item']">
    <div v-if="items.length" class="overflow-x-hidden">
      <TableMobileItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        :actionBuilder="itemActionBuilder"
        @click="$emit('itemClick', item)"
      >
        <slot name="mobile-item" :item="item"></slot>
      </TableMobileItem>
    </div>
    <!-- Mobile empty view -->
    <div v-else-if="!loading">
      <slot name="mobile-empty"></slot>
    </div>
    <!-- Mobile skeleton view -->
    <div v-else>
      <slot name="mobile-skeleton"></slot>
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
          @click="column.sortable ? $emit('headerClick', column.id) : null"
        >
          {{ column.title }}
          <template v-if="column.sortable && sort">
            <i
              class="fas fa-caret-down ml-2"
              v-if="sort.column === column.id && sort.direction === SORT_DESCENDING"
            ></i>
            <i class="fas fa-caret-up ml-2" v-if="sort.column === column.id && sort.direction === SORT_ASCENDING"></i>
          </template>
        </th>
      </tr>
    </thead>
    <!-- Desktop table body -->
    <tbody v-if="!loading && items.length">
      <slot name="desktop-body"></slot>
    </tbody>
    <!-- Desktop empty view -->
    <tbody v-else-if="!loading && !items.length">
      <slot name="desktop-empty"></slot>
    </tbody>
    <!-- Desktop table skeleton -->
    <tbody v-else>
      <slot name="desktop-skeleton"></slot>
    </tbody>
  </table>

  <!-- Table footer -->
  <slot name="footer" v-if="($slots['footer'] || footer) && items && items.length">
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
import { ISortInfo } from "@/core/types";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { SORT_ASCENDING, SORT_DESCENDING } from "@/core/constants";
import { PropType } from "vue";
import TableMobileItem from "./_internal/table-mobile-item/table-mobile-item.vue";

defineProps({
  columns: {
    type: Array as PropType<ITableColumn[]>,
    default: () => [],
  },

  items: {
    type: Array as PropType<any[]>,
    default: () => [],
  },

  itemActionBuilder: {
    type: Function as PropType<(obj: any) => ItemAction[]>,
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
