<template>
  <div class="vc-table">
    <!-- Mobile table view -->
    <div v-if="isMobile && $slots['mobile-item']" class="vc-table__mobile">
      <!-- Mobile skeleton view -->
      <template v-if="loading">
        <slot name="mobile-skeleton">
          <!-- Default mobile skeleton template -->
          <div v-for="row in skeletonRows" :key="row" class="vc-table__mobile-skeleton-card">
            <div v-for="block in 4" :key="block" class="vc-table__mobile-skeleton-block">
              <div class="vc-table__mobile-skeleton-label" />

              <div class="vc-table__mobile-skeleton-item" />
            </div>
          </div>
        </slot>
      </template>

      <!-- Mobile empty view -->
      <slot v-else-if="!items.length" name="mobile-empty" />

      <!-- Mobile item view -->
      <template v-else>
        <slot v-for="(item, index) in items" :key="item.id || index" name="mobile-item" :item="item" />
      </template>
    </div>

    <!-- Desktop table view -->
    <table v-else class="vc-table__desktop">
      <caption v-if="description" class="vc-table__caption">
        {{
          description
        }}
      </caption>

      <slot name="header">
        <thead v-if="!hideDefaultHeader && columns.length" class="vc-table__head">
          <tr class="vc-table__row">
            <th
              v-for="column in columns"
              :key="column.id"
              scope="col"
              :aria-sort="getAriaSort(column.id)"
              :class="[
                'vc-table__cell',
                'vc-table__cell--head',
                `vc-table__cell--align--${column.align ?? 'left'}`,
                {
                  'vc-table__cell--sortable': column.sortable,
                },
                column.classes,
              ]"
            >
              <button
                v-if="column.sortable && sort"
                type="button"
                class="vc-table__sort-button"
                @click="
                  $emit('headerClick', {
                    column: column.id,
                    direction: toggleSortDirection(sort.direction),
                  })
                "
              >
                {{ column.title }}

                <VcIcon
                  v-if="sort.column === column.id"
                  :class="[
                    'vc-table__sort-icon',
                    {
                      'vc-table__sort-icon--asc': sort.direction === 'asc',
                    },
                  ]"
                  name="chevron-up"
                  size="xxs"
                />
              </button>

              <span v-else class="vc-table__column-title">{{ column.title }}</span>
            </th>
          </tr>
        </thead>
      </slot>

      <!-- Desktop skeleton view -->
      <tbody v-if="loading" class="vc-table__body">
        <slot name="desktop-skeleton">
          <!-- Default skeleton template -->
          <tr v-for="row in skeletonRows" :key="row" class="vc-table__row vc-table__row--skeleton">
            <td
              v-for="column in columns"
              :key="column.id"
              :class="[
                'vc-table__cell',
                'vc-table__cell--skeleton',
                `vc-table__cell--align--${column.align ?? 'left'}`,
                column.classes,
              ]"
            >
              <div class="vc-table__skeleton-item" />
            </td>
          </tr>
        </slot>
      </tbody>

      <!-- Desktop empty view -->
      <tbody v-else-if="!items.length" class="vc-table__body">
        <slot name="desktop-empty" />
      </tbody>

      <!-- Desktop table view (custom body) -->
      <tbody v-else-if="$slots['desktop-body']" class="vc-table__body">
        <slot name="desktop-body" />
      </tbody>

      <!-- Desktop table item view -->
      <tbody v-else-if="items.length && $slots['desktop-item']" class="vc-table__body">
        <slot v-for="(item, index) in items" :key="item.id || index" name="desktop-item" :item="item" />
      </tbody>
    </table>

    <!-- Table footer -->
    <slot name="footer">
      <div class="vc-table__footer">
        <div v-if="pageLimit && page >= pageLimit" class="vc-table__page-limit-message">
          <slot name="page-limit-message">
            {{ $t("ui_kit.reach_limit.page_limit") }}
          </slot>
        </div>

        <VcPagination
          v-if="!hideDefaultFooter && items.length && pages > 1"
          :page="page"
          :pages="Math.min(pages, pageLimit || pages)"
          @update:page="onPageUpdate"
        />
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts" generic="T extends ItemType">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed } from "vue";
import { SKELETON_ROWS_SIZE, PAGE_LIMIT } from "@/ui-kit/constants";

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
    mobileBreakpoint?: "none" | BreakpointsType;
    skeletonRows?: number;
  }>(),
  {
    columns: () => [],
    items: () => [],
    pages: 0,
    page: 0,
    pageLimit: PAGE_LIMIT,
    mobileBreakpoint: "md",
    skeletonRows: SKELETON_ROWS_SIZE,
  },
);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = computed(() => {
  if (props.mobileBreakpoint === "none") {
    return false;
  }
  if (props.mobileBreakpoint === "xs") {
    return true;
  }
  const breakpoint: "sm" | "md" | "lg" | "xl" | "2xl" = props.mobileBreakpoint;
  return breakpoints.smaller(breakpoint).value;
});

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
</script>

<style lang="scss">
.vc-table {
  &__desktop {
    @apply w-full text-left text-sm;

    &--desktop {
      @apply table-auto;
    }
  }

  &__caption {
    @apply sr-only;
  }

  &__head {
    @apply border-b border-neutral-200;
  }

  &__row {
    &--skeleton {
      @apply even:bg-neutral-50;
    }
  }

  &__cell {
    &--head {
      @apply px-4 py-2 font-bold;
    }

    &--sortable {
      @apply cursor-pointer;
    }

    &--skeleton {
      @apply px-4 py-3;
    }

    &--align {
      &--left {
        @apply text-start;
      }

      &--center {
        @apply text-center;
      }

      &--right {
        @apply text-end;
      }
    }
  }

  &__skeleton-item {
    @apply h-6 animate-pulse bg-neutral-200;
  }

  &__sort-button {
    @apply inline-flex items-center gap-2 p-1 rounded;
  }

  &__sort-icon {
    @apply size-2.5;

    &--asc {
      @apply rotate-180;
    }
  }

  &__footer {
    @apply px-3 py-10 empty:hidden md:px-5 md:pb-5;
  }

  &__page-limit-message {
    @apply mb-3 text-center;
  }

  &__mobile-skeleton-card {
    @apply grid grid-cols-2 gap-4 border-b border-neutral-200 p-6;
  }

  &__mobile-skeleton-block {
    @apply flex flex-col gap-1;
  }

  &__mobile-skeleton-label {
    @apply h-3.5 w-20 animate-pulse bg-neutral-200;
  }

  &__mobile-skeleton-item {
    @apply h-5 animate-pulse bg-neutral-200;
  }
}
</style>
