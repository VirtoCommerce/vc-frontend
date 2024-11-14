<template>
  <!-- Mobile table view -->
  <div v-if="isMobile && $slots['mobile-item']">
    <!-- Mobile skeleton view -->
    <slot v-if="loading" name="mobile-skeleton" />

    <!-- Mobile empty view -->
    <slot v-else-if="!items.length" name="mobile-empty" />

    <!-- Mobile item view -->
    <template v-else>
      <slot v-for="(item, index) in items" :key="item.id || index" name="mobile-item" :item="item" />
    </template>
  </div>

  <!-- Desktop table view -->
  <table v-else class="w-full table-fixed text-left text-sm" :aria-describedby="description">
    <slot name="header">
      <thead v-if="!hideDefaultHeader && columns.length" class="border-b border-neutral-200">
        <tr>
          <th
            v-for="column in columns"
            :key="column.id"
            class="px-5 py-3 font-bold"
            :class="[{ 'cursor-pointer': column.sortable }, `text-${column.align || 'left'}`, column.classes]"
            @click="
              column.sortable && sort
                ? $emit('headerClick', { column: column.id, direction: toggleSortDirection(sort.direction) })
                : null
            "
          >
            {{ column.title }}

            <template v-if="column.sortable && sort && sort.column === column.id">
              <VcIcon
                v-if="sort.direction === SortDirection.Descending"
                class="ms-1 mt-1.5"
                name="chevron-up"
                size="xxs"
              />
              <VcIcon
                v-else-if="sort.direction === SortDirection.Ascending"
                class="ms-1 mt-1.5"
                name="chevron-down"
                size="xxs"
              />
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
    <div class="px-3 py-10 empty:hidden md:px-5 md:pb-5">
      <p v-if="pageLimit && page >= pageLimit" class="mb-3 text-center">
        <slot name="page-limit-message">
          {{ $t("ui_kit.reach_limit.page_limit") }}
        </slot>
      </p>

      <VcPagination
        v-if="!hideDefaultFooter && items.length && pages > 1"
        :page="page"
        :pages="Math.min(pages, pageLimit || pages)"
        @update:page="onPageUpdate"
      />
    </div>
  </slot>
</template>

<script setup lang="ts" generic="T extends ItemType">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { PAGE_LIMIT } from "@/core/constants";
import { SortDirection } from "@/core/enums";
import type { ISortInfo } from "@/core/types";

export type ItemType = {
  id?: string | number;
  [key: string]: unknown;
};

interface IEmits {
  (event: "itemClick", item: T): void;
  (event: "headerClick", item: ISortInfo): void;
  (event: "pageChanged", page: number): void;
}

interface IProps {
  columns?: ITableColumn[];
  items?: T[];
  sort?: ISortInfo;
  pages?: number;
  page?: number;
  loading?: boolean;
  hideDefaultHeader?: boolean;
  hideDefaultFooter?: boolean;
  description?: string;
  pageLimit?: number | null;
}

const emit = defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  columns: () => [],
  items: () => [],
  pages: 0,
  page: 0,
  pageLimit: PAGE_LIMIT,
});

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

const onPageUpdate = (newPage: number) => {
  emit("pageChanged", newPage);
};

function toggleSortDirection(currentDirection: SortDirection): SortDirection {
  return currentDirection === SortDirection.Descending ? SortDirection.Ascending : SortDirection.Descending;
}
</script>
