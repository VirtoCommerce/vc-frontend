<template>
  <!-- Mobile table view -->
  <template v-if="isMobile && $slots['mobile-item']">
    <div v-if="items.length">
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
  <table v-else class="table-fixed text-sm text-left w-full">
    <thead v-if="columns" class="border-b border-gray-200">
      <tr>
        <th
          v-for="column in columns"
          :key="column.id"
          class="py-3 px-5 font-extrabold"
          :class="[column.sortable && 'cursor-pointer', column.titlePosition]"
          @click="$emit('headerClick', column.id)"
        >
          {{ column.title }}
          <template v-if="column.sortable && sort">
            <i class="fas fa-caret-down ml-2" v-if="sort.column === column.id && sort.direction === sortDescending"></i>
            <i class="fas fa-caret-up ml-2" v-if="sort.column === column.id && sort.direction === sortAscending"></i>
          </template>
        </th>
      </tr>
    </thead>
    <!-- Desktop table body -->
    <tbody v-if="items.length">
      <slot name="desktop-body"></slot>
    </tbody>
    <!-- Desktop empty view -->
    <tbody v-else-if="!loading">
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
import { ITableColumn, ItemAction, VcPagination } from "@/components";
import { ISortInfo } from "@/shared/account";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { sortAscending, sortDescending } from "@/core/constants";
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
});

const emit = defineEmits(["itemClick", "headerClick", "pageChanged"]);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

const onPageUpdate = (newPage: number) => {
  emit("pageChanged", newPage);
};
</script>
