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
  <table v-else :class="['w-full text-left text-sm', isMobile ? 'table-fixed' : 'table-auto' ]">
    <caption v-if="description" class="sr-only">
      {{
        description
      }}
    </caption>

    <slot name="header">
      <thead v-if="!hideDefaultHeader && columns.length" class="border-b border-neutral-200">
        <tr>
          <th
            v-for="column in columns"
            :key="column.id"
            scope="col"
            :aria-sort="getAriaSort(column.id)"
            class="px-4 py-3 font-bold"
            :class="[column.sortable ? 'cursor-pointer' : '', alignClass(column.align), column.classes]"
          >
            <template v-if="column.sortable && sort">
              <button
                type="button"
                class="inline-flex items-center gap-1"
                @click="
                  $emit('headerClick', {
                    column: column.id,
                    direction: toggleSortDirection(sort.direction),
                  })
                "
              >
                {{ column.title }}

                <template v-if="sort.column === column.id">
                  <VcIcon
                    v-if="sort.direction === SortDirection.Descending"
                    class="ms-1"
                    name="chevron-up"
                    size="xxs"
                  />

                  <VcIcon
                    v-else-if="sort.direction === SortDirection.Ascending"
                    class="ms-1"
                    name="chevron-down"
                    size="xxs"
                  />
                </template>
              </button>
            </template>

            <template v-else>
              <span>{{ column.title }}</span>
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

    <!-- Desktop table view (custom body) -->
    <tbody v-else-if="$slots['desktop-body']">
      <slot name="desktop-body" />
    </tbody>

    <!-- Desktop table item view -->
    <tbody v-else-if="items.length && $slots['desktop-item']">
      <slot v-for="(item, index) in items" :key="item.id || index" name="desktop-item" :item="item" />
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
import { computed } from "vue";
import { PAGE_LIMIT } from "@/core/constants";
import { SortDirection } from "@/core/enums";
import type { ISortInfo } from "@/core/types";

export type ItemType = {
  id?: string | number;
  [key: string]: unknown;
};

const emit = defineEmits<{
  (event: "headerClick", item: ISortInfo): void;
  (event: "pageChanged", page: number): void;
}>();

const props = withDefaults(
  defineProps<{
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
    mobileBreakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
  }>(),
  {
    columns: () => [],
    items: () => [],
    pages: 0,
    page: 0,
    pageLimit: PAGE_LIMIT,
    mobileBreakpoint: "md",
  },
);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = computed(() => breakpoints.smaller(props.mobileBreakpoint).value);

function onPageUpdate(newPage: number) {
  emit("pageChanged", newPage);
}

function toggleSortDirection(currentDirection: SortDirection): SortDirection {
  return currentDirection === SortDirection.Descending ? SortDirection.Ascending : SortDirection.Descending;
}

function getAriaSort(columnId: unknown): "ascending" | "descending" | "none" {
  if (!props.sort || props.sort.column !== columnId) {
    return "none";
  }

  return props.sort.direction === SortDirection.Ascending ? "ascending" : "descending";
}

const ALIGN_MAP = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

function alignClass(align?: keyof typeof ALIGN_MAP): string {
  if (!align) {
    return ALIGN_MAP.left;
  }

  return (ALIGN_MAP as Record<string, string>)[align] ?? ALIGN_MAP.left;
}
</script>
