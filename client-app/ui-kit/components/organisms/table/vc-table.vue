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
  <table v-else :class="[layout, 'w-full text-left text-sm']">
    <slot name="header">
      <thead v-if="!hideDefaultHeader && columns.length" class="border-b border-gray-200">
        <tr>
          <th
            v-for="column in columns"
            :key="column.id"
            class="px-5 py-3 font-extrabold"
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
    </slot>

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
  <slot name="footer">
    <VcPagination
      v-if="!hideDefaultFooter && items.length && pages > 1"
      :page="page"
      :pages="pages"
      class="self-start"
      :class="[isMobile ? 'px-6 py-10' : 'mt-5 px-5 pb-5']"
      @update:page="onPageUpdate"
    />
  </slot>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { SORT_ASCENDING, SORT_DESCENDING } from "@/core/constants";
import { toggleSortDirection } from "@/core/utilities";
import type { ISortInfo } from "@/core/types";

interface IEmits {
  (event: "itemClick", item: any): void;
  (event: "headerClick", item: ISortInfo): void;
  (event: "pageChanged", page: number): void;
}

interface IProps {
  columns?: ITableColumn[];
  items?: any[];
  itemActionsBuilder?: (inputObject: any) => SlidingActionsItem[];
  sort?: ISortInfo;
  pages?: number;
  page?: number;
  loading?: boolean;
  hideDefaultHeader?: boolean;
  hideDefaultFooter?: boolean;
  layout?: string;
}

const emit = defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  columns: () => [],
  items: () => [],
  pages: 0,
  page: 0,
  layout: "table-fixed",
});

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

const onPageUpdate = (newPage: number) => {
  emit("pageChanged", newPage);
};
</script>
