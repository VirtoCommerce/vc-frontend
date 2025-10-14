<template>
  <div class="vc-table">
    <!-- Mobile table view -->
    <div v-if="isMobile && $slots['mobile-item']" class="vc-table__mobile">
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
                      'vc-table__sort-icon--asc': sort.direction === SortDirection.Ascending,
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
        <slot name="desktop-skeleton" />
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
import { PAGE_LIMIT } from "@/ui-kit/constants";
import { SortDirection } from "@/ui-kit/enums";

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
const isMobile = computed(() => props.mobileBreakpoint !== "none" && breakpoints.smaller(props.mobileBreakpoint).value);

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

  &__cell {
    &--head {
      @apply px-4 py-2 font-bold;
    }

    &--sortable {
      @apply cursor-pointer;
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
}
</style>
