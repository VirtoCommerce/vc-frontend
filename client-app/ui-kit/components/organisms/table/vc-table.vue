<template>
  <div class="vc-table">
    <!-- Hidden container for VcTableColumn children (renderless, needed for provide/inject registration) -->
    <div v-show="false" aria-hidden="true">
      <slot />
    </div>

    <!-- Mobile table view -->
    <div v-if="isMobile && $slots['mobile-item']" class="vc-table__mobile">
      <!-- Mobile skeleton view -->
      <slot v-if="loading" name="mobile-skeleton">
        <!-- Default mobile skeleton template -->
        <div v-for="row in skeletonRows" :key="row" class="vc-table__mobile-skeleton">
          <div v-for="block in 4" :key="block" class="vc-table__mobile-skeleton-block">
            <div class="vc-table__mobile-skeleton-label" />

            <div class="vc-table__mobile-skeleton-item" />
          </div>
        </div>
      </slot>

      <!-- Mobile empty view -->
      <slot v-else-if="!items.length" name="mobile-empty" />

      <!-- Mobile item view -->
      <slot v-else v-for="(item, index) in items" :key="getItemKey(item, index)" name="mobile-item" :item="item" />
    </div>

    <!-- Desktop table view -->
    <VcScrollbar v-else :horizontal="scrollable" class="vc-table__scrollbar">
      <table :class="['vc-table__desktop', { 'vc-table__desktop--fixed': hasColumnWidths }]">
        <caption v-if="description" class="vc-table__caption">
          {{
            description
          }}
        </caption>

        <!-- Column width definitions for stable layout -->
        <colgroup v-if="hasColumnWidths">
          <col
            v-for="column in mergedColumns"
            :key="column.id"
            :style="column.width ? { width: column.width } : undefined"
          />
        </colgroup>

        <slot name="header">
          <thead v-if="!hideDefaultHeader && mergedColumns.length" class="vc-table__head">
            <tr class="vc-table__head-row">
              <th
                v-for="column in mergedColumns"
                :key="column.id"
                scope="col"
                :aria-sort="getAriaSort(column.id)"
                :class="[
                  'vc-table__title',
                  `vc-table__title--align--${column.align ?? 'left'}`,
                  {
                    'vc-table__title--sortable': column.sortable,
                  },
                  column.classes,
                ]"
              >
                <!-- Custom per-column header slot -->
                <HeaderCellRenderer
                  v-if="getColumnHeaderSlot(column.id)"
                  :slot-fn="getColumnHeaderSlot(column.id)"
                  :column="column"
                />

                <button
                  v-else-if="column.sortable && sort"
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
            <tr v-for="row in skeletonRows" :key="row" class="vc-table__skeleton">
              <td
                v-for="column in mergedColumns"
                :key="column.id"
                :class="[
                  'vc-table__skeleton-cell',
                  `vc-table__skeleton-cell--align--${column.align ?? 'left'}`,
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

        <!-- Desktop table view with VcTableColumn slots -->
        <tbody v-else-if="items.length && hasColumnSlots" class="vc-table__body">
          <tr
            v-for="(item, rowIndex) in items"
            :key="getItemKey(item, rowIndex)"
            :class="['vc-table__row', resolvedRowProps[rowIndex]?.class]"
            :style="resolvedRowProps[rowIndex]?.style"
            v-bind="resolvedRowProps[rowIndex]?.attrs"
            @click="$emit('rowClick', item, rowIndex)"
          >
            <td
              v-for="column in mergedColumns"
              :key="column.id"
              :class="['vc-table__cell', `vc-table__cell--align--${column.align ?? 'left'}`, column.classes]"
            >
              <CellRenderer
                v-if="getColumnSlot(column.id)"
                :slot-fn="getColumnSlot(column.id)"
                :item="item"
                :index="rowIndex"
              />
            </td>
          </tr>
        </tbody>

        <!-- Desktop table item view -->
        <tbody v-else-if="items.length && $slots['desktop-item']" class="vc-table__body">
          <slot v-for="(item, index) in items" :key="getItemKey(item, index)" name="desktop-item" :item="item" />
        </tbody>
      </table>
    </VcScrollbar>

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

<script setup lang="ts" generic="T extends VcTableItemType">
import { useBreakpoints } from "@vueuse/core";
import { computed, defineComponent, Fragment, provide, ref, useSlots } from "vue";
import { BREAKPOINTS, TABLE_SKELETON_ROWS_SIZE, TABLE_PAGE_LIMIT } from "@/ui-kit/constants";
import VcTableColumn from "./vc-table-column.vue";
import { vcTableKey } from "./vc-table-context";
import type { PropType, VNode } from "vue";

const emit = defineEmits<{
  (event: "headerClick", item: VcTableSortInfoType): void;
  (event: "pageChanged", page: number): void;
  (event: "rowClick", item: T, index: number): void;
}>();

const props = withDefaults(
  defineProps<{
    columns?: VcTableColumnType[];
    items?: T[];
    sort?: VcTableSortInfoType;
    pages?: number;
    page?: number;
    loading?: boolean;
    hideDefaultHeader?: boolean;
    hideDefaultFooter?: boolean;
    description?: string;
    pageLimit?: number | null;
    mobileBreakpoint?: "none" | BreakpointsType;
    skeletonRows?: number;
    bordered?: boolean;
    mobileBordered?: boolean;
    scrollable?: boolean;
    /**
     * Function that returns class, style, and attrs to apply to each row `<tr>`.
     * Receives the item and its row index as arguments.
     *
     * @example
     * :row-props="(item) => ({ class: { 'bg-red-100': item.isOverdue } })"
     */
    rowProps?: (item: T, index: number) => VcTableRowPropsType;
  }>(),
  {
    columns: () => [],
    items: () => [],
    pages: 0,
    page: 0,
    pageLimit: TABLE_PAGE_LIMIT,
    mobileBreakpoint: "md",
    skeletonRows: TABLE_SKELETON_ROWS_SIZE,
  },
);

// Track columns registered by VcTableColumn children
const childColumns = ref<Map<string, VcTableColumnRegistrationType>>(new Map());

// Provide context to child VcTableColumn components
provide<VcTableContextType>(vcTableKey, {
  registerColumn(
    column: VcTableColumnType,
    slot?: VcTableColumnSlotFnType,
    headerSlot?: VcTableColumnHeaderSlotFnType,
  ) {
    childColumns.value.set(column.id, { column, slot, headerSlot });
    childColumns.value = new Map(childColumns.value);
  },
  unregisterColumn(columnId: string) {
    childColumns.value.delete(columnId);
    childColumns.value = new Map(childColumns.value);
  },
});

// Extract column IDs from slot VNodes in strict template order
const slots = useSlots();

function extractColumnIds(vnodes: VNode[]): string[] {
  const ids: string[] = [];
  for (const node of vnodes) {
    if (node.type === VcTableColumn && node.props?.id) {
      ids.push(String(node.props.id));
    } else if (node.type === Fragment && Array.isArray(node.children)) {
      ids.push(...extractColumnIds(node.children as VNode[]));
    }
  }
  return ids;
}

const templateColumnOrder = computed<string[]>(() => {
  if (!slots.default) {
    return [];
  }
  return extractColumnIds(slots.default());
});

// Get sorted child column registrations based on template VNode order
const sortedChildColumnRegistrations = computed<VcTableColumnRegistrationType[]>(() => {
  const order = templateColumnOrder.value;
  const registrations = Array.from(childColumns.value.values());

  return registrations.sort((a, b) => {
    const aIdx = order.indexOf(a.column.id);
    const bIdx = order.indexOf(b.column.id);

    if (aIdx === -1 && bIdx === -1) {
      return 0;
    }
    if (aIdx === -1) {
      return 1;
    }
    if (bIdx === -1) {
      return -1;
    }

    return aIdx - bIdx;
  });
});

// Check if any child column has a slot defined (enables slot-based rendering)
const hasColumnSlots = computed<boolean>(() => {
  return sortedChildColumnRegistrations.value.some((reg) => reg.slot !== undefined);
});

// Check if any column has a width defined (enables table-layout: fixed)
const hasColumnWidths = computed<boolean>(() => {
  return mergedColumns.value.some((col) => col.width !== undefined);
});

// Merge prop columns with child columns
// Child columns take precedence over prop columns when both exist
const mergedColumns = computed<VcTableColumnType[]>(() => {
  // If no child columns, just return prop columns (backward compatibility)
  if (childColumns.value.size === 0) {
    return props.columns;
  }

  // If no prop columns, return child columns sorted by order
  if (props.columns.length === 0) {
    return sortedChildColumnRegistrations.value.map((item) => item.column);
  }

  // Merge: child columns take precedence, maintain child order
  const usedIds = new Set<string>();

  // Create merged result - child columns define the order and override props
  const result: VcTableColumnType[] = [];

  for (const childReg of sortedChildColumnRegistrations.value) {
    result.push(childReg.column);
    usedIds.add(childReg.column.id);
  }

  // Add any prop columns not overridden by children (at the end)
  for (const propCol of props.columns) {
    if (!usedIds.has(propCol.id)) {
      result.push(propCol);
    }
  }

  return result;
});

// Get column slot by column id
function getColumnSlot(columnId: string): VcTableColumnSlotFnType | undefined {
  return childColumns.value.get(columnId)?.slot;
}

// Get column header slot by column id
function getColumnHeaderSlot(columnId: string): VcTableColumnHeaderSlotFnType | undefined {
  return childColumns.value.get(columnId)?.headerSlot;
}

/**
 * Pre-computed row props for all items.
 * Avoids calling the rowProps function multiple times per row in the template.
 */
const resolvedRowProps = computed<VcTableRowPropsType[]>(() => {
  if (!props.rowProps) {
    return [];
  }
  return props.items.map((item, index) => props.rowProps!(item, index));
});

// Stable cell renderer — avoids creating a new functional component identity on every render
const CellRenderer = defineComponent({
  props: {
    slotFn: {
      type: Function as PropType<VcTableColumnSlotFnType>,
      default: undefined,
    },

    item: {
      type: Object,
      required: true,
    },

    index: {
      type: Number,
      required: true,
    },
  },

  setup(cellProps) {
    return () => cellProps.slotFn?.({ item: cellProps.item, index: cellProps.index });
  },
});

// Stable header cell renderer for custom column header slots
const HeaderCellRenderer = defineComponent({
  props: {
    slotFn: {
      type: Function as PropType<VcTableColumnHeaderSlotFnType>,
      default: undefined,
    },

    column: {
      type: Object as PropType<VcTableColumnType>,
      required: true,
    },
  },

  setup(headerProps) {
    return () => headerProps.slotFn?.({ column: headerProps.column });
  },
});

const breakpoints = useBreakpoints(BREAKPOINTS);
const isMobile = computed(() => {
  if (props.mobileBreakpoint === "none") {
    return false;
  }
  return breakpoints.smaller(props.mobileBreakpoint).value;
});

const desktopBorderWidth = computed(() => (props.bordered ? "1px" : "0"));
const mobileBorderWidth = computed(() => (props.mobileBordered ? "1px" : "0"));

const desktopRadius = computed(() => (props.bordered ? "var(--radius)" : "0"));
const mobileRadius = computed(() => (props.mobileBordered ? "var(--radius)" : "0"));

function onPageUpdate(newPage: number) {
  emit("pageChanged", newPage);
}

function toggleSortDirection(currentDirection: string): VcTableSortDirectionType {
  return currentDirection === "desc" ? "asc" : "desc";
}

function getAriaSort(columnId: unknown): "ascending" | "descending" | "none" {
  if (!props.sort || props.sort.column !== columnId) {
    return "none";
  }

  return props.sort.direction === "asc" ? "ascending" : "descending";
}

/**
 * Gets a unique key for table row rendering.
 * Tries to use item.id if available, otherwise falls back to index.
 */
function getItemKey(item: T, index: number): string | number {
  const itemWithId = item as { id?: string | number };
  return itemWithId.id ?? index;
}
</script>

<style lang="scss">
.vc-table {
  --radius: var(--vc-table-radius, var(--vc-radius, 0.5rem));
  --desktop-radius: v-bind(desktopRadius);
  --desktop-border-width: v-bind(desktopBorderWidth);
  --mobile-border-width: v-bind(mobileBorderWidth);
  --mobile-radius: v-bind(mobileRadius);

  &__mobile {
    @apply border-neutral-200;

    word-break: break-word;
    border-style: solid;
    border-width: var(--mobile-border-width);
    border-radius: var(--mobile-radius);
  }

  &__mobile-skeleton {
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

  &__scrollbar {
    @apply w-full border-neutral-200;

    border-style: solid;
    border-width: var(--desktop-border-width);
    border-radius: var(--desktop-radius);
  }

  &__desktop {
    @apply w-full text-left text-sm;

    &--fixed {
      table-layout: fixed;
    }
  }

  &__caption {
    @apply sr-only;
  }

  &__head {
    @apply border-b border-neutral-200;
  }

  &__title {
    @apply px-4 py-1 h-10 font-bold;

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

  &__body {
    word-break: break-word;

    &:first-child {
      tr:first-child {
        td:first-child {
          @apply rounded-tl-[--desktop-radius];
        }

        td:last-child {
          @apply rounded-tr-[--desktop-radius];
        }
      }
    }

    tr:last-child {
      td:first-child {
        @apply rounded-bl-[--desktop-radius];
      }

      td:last-child {
        @apply rounded-br-[--desktop-radius];
      }
    }
  }

  &__row {
    &:nth-child(even) {
      @apply bg-neutral-50;
    }

    &:hover {
      @apply bg-neutral-200;
    }
  }

  &__skeleton {
    &:nth-child(even) {
      @apply bg-neutral-50;
    }
  }

  &__skeleton-cell {
    @apply px-4 py-3;

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

  &__cell {
    @apply px-4 py-3;

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
    @apply inline-flex items-center gap-2 p-1 -m-1 rounded;
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
