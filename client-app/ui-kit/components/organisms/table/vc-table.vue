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
    <VcScrollbar
      v-else
      :horizontal="scrollable"
      :vertical="!!maxHeight"
      :focusable="scrollable || !!maxHeight"
      :style="scrollbarStyle"
      class="vc-table__scrollbar"
    >
      <table :class="['vc-table__desktop', { 'vc-table__desktop--scrollable': scrollable }]">
        <caption v-if="description" class="vc-table__caption">
          {{
            description
          }}
        </caption>

        <slot name="header">
          <thead
            v-if="!hideDefaultHeader && orderedColumns.length"
            :class="['vc-table__head', { 'vc-table__head--sticky': stickyHeader || maxHeight }]"
          >
            <tr class="vc-table__head-row">
              <th
                v-for="column in orderedColumns"
                :key="column.id"
                scope="col"
                :aria-sort="getAriaSort(column.id)"
                :class="[
                  'vc-table__title',
                  `vc-table__title--align--${column.align ?? 'left'}`,
                  {
                    'vc-table__title--sortable': column.sortable,
                  },
                  getColumnFixedClasses(column, 'vc-table__title'),
                  column.classes,
                ]"
                :style="getColumnStyle(column)"
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
                v-for="column in orderedColumns"
                :key="column.id"
                :class="[
                  'vc-table__skeleton-cell',
                  `vc-table__skeleton-cell--align--${column.align ?? 'left'}`,
                  getColumnFixedClasses(column, 'vc-table__skeleton-cell'),
                  column.classes,
                ]"
                :style="getColumnStyle(column)"
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
            :class="['vc-table__row', resolvedRowClass(item, rowIndex)]"
            :style="resolvedRowStyle(item, rowIndex)"
            :tabindex="hasRowClickListener ? 0 : undefined"
            :role="hasRowClickListener ? 'button' : undefined"
            @click="$emit('rowClick', item, rowIndex)"
            @keydown.enter="$emit('rowClick', item, rowIndex)"
          >
            <td
              v-for="column in orderedColumns"
              :key="column.id"
              :class="[
                'vc-table__cell',
                `vc-table__cell--align--${column.align ?? 'left'}`,
                getColumnFixedClasses(column, 'vc-table__cell'),
                column.classes,
              ]"
              :style="getColumnStyle(column)"
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
          @update:page="$emit('pageChanged', $event)"
        />
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts" generic="T extends VcTableItemType">
import { useBreakpoints } from "@vueuse/core";
import { computed, defineComponent, Fragment, getCurrentInstance, provide, ref, useSlots } from "vue";
import { BREAKPOINTS, TABLE_SKELETON_ROWS_SIZE, TABLE_PAGE_LIMIT } from "@/ui-kit/constants";
import VcTableColumn from "./vc-table-column.vue";
import { vcTableKey } from "./vc-table-context";
import type { PropType, VNode } from "vue";

defineEmits<{
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
     * Makes the table header sticky. When used without `maxHeight`, the header
     * sticks to the top of the viewport during page scroll. When used with
     * `maxHeight`, the header sticks to the top of the scrollable container.
     */
    stickyHeader?: boolean;
    /**
     * Maximum height of the table. When set, enables vertical scrolling
     * within the table container. Automatically enables sticky header.
     *
     * @example max-height="400px"
     * @example max-height="50vh"
     */
    maxHeight?: string;
    /**
     * Dynamic per-item class for rows. Receives the item and row index.
     *
     * @example :row-class="(item) => ({ 'bg-red-100': item.isOverdue })"
     */
    rowClass?: string | Record<string, boolean> | ((item: T, index: number) => string | Record<string, boolean>);
    /**
     * Dynamic per-item inline style for rows. Receives the item and row index.
     *
     * @example :row-style="(item) => ({ opacity: item.isDisabled ? '0.5' : '1' })"
     */
    rowStyle?: string | Record<string, string> | ((item: T, index: number) => string | Record<string, string>);
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

const FIXED_COLUMN_DEFAULT_WIDTH = "150px";

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
  },
  unregisterColumn(columnId: string) {
    childColumns.value.delete(columnId);
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

  const fallback = registrations.length;
  return registrations.sort((a, b) => {
    const aIdx = order.indexOf(a.column.id);
    const bIdx = order.indexOf(b.column.id);

    // Items not in template order sort to the end; preserve relative order among them
    return (aIdx === -1 ? fallback : aIdx) - (bIdx === -1 ? fallback : bIdx);
  });
});

// Check if any child column has a slot defined (enables slot-based rendering)
const hasColumnSlots = computed<boolean>(() => {
  return sortedChildColumnRegistrations.value.some((reg) => reg.slot !== undefined);
});

// Compute cumulative sticky offsets for fixed columns.
// Uses calc() to support any CSS unit (px, rem, em, etc.), not just pixels.
const columnOffsets = computed<Map<string, string>>(() => {
  const offsets = new Map<string, string>();
  const cols = orderedColumns.value;

  // Start offsets
  const startWidths: string[] = [];
  for (const col of cols) {
    if (col.fixed === "start") {
      offsets.set(col.id, startWidths.length ? `calc(${startWidths.join(" + ")})` : "0px");
      startWidths.push(col.width ?? FIXED_COLUMN_DEFAULT_WIDTH);
    }
  }

  // End offsets (iterate from the end)
  const endWidths: string[] = [];
  for (let i = cols.length - 1; i >= 0; i--) {
    const col = cols[i];
    if (col.fixed === "end") {
      offsets.set(col.id, endWidths.length ? `calc(${endWidths.join(" + ")})` : "0px");
      endWidths.push(col.width ?? FIXED_COLUMN_DEFAULT_WIDTH);
    }
  }

  return offsets;
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

// Reorder columns: fixed-start → normal → fixed-end
// This ensures fixed columns are always at the edges, regardless of template order
const orderedColumns = computed<VcTableColumnType[]>(() => {
  const cols = mergedColumns.value;
  const start = cols.filter((col) => col.fixed === "start");
  const center = cols.filter((col) => !col.fixed);
  const end = cols.filter((col) => col.fixed === "end");
  return [...start, ...center, ...end];
});

// Get column slot by column id
function getColumnSlot(columnId: string): VcTableColumnSlotFnType | undefined {
  return childColumns.value.get(columnId)?.slot;
}

// Get column header slot by column id
function getColumnHeaderSlot(columnId: string): VcTableColumnHeaderSlotFnType | undefined {
  return childColumns.value.get(columnId)?.headerSlot;
}

// Detect edge fixed columns for shadow rendering
const lastFixedStartId = computed<string | undefined>(() => {
  const cols = orderedColumns.value.filter((col) => col.fixed === "start");
  return cols.length ? cols[cols.length - 1].id : undefined;
});

const firstFixedEndId = computed<string | undefined>(() => {
  return orderedColumns.value.find((col) => col.fixed === "end")?.id;
});

// Get inline style for fixed (sticky) columns
function getColumnStyle(column: VcTableColumnType): Record<string, string> | undefined {
  const offset = columnOffsets.value.get(column.id);

  if (column.fixed && offset !== undefined) {
    const width = column.width ?? FIXED_COLUMN_DEFAULT_WIDTH;
    const cssProperty = column.fixed === "start" ? "inset-inline-start" : "inset-inline-end";
    return { position: "sticky", [cssProperty]: offset, zIndex: "3", width, minWidth: width, maxWidth: width };
  }

  if (column.width) {
    return { minWidth: column.width };
  }

  return undefined;
}

// Get fixed column CSS classes (fixed flag + edge shadow markers)
function getColumnFixedClasses(column: VcTableColumnType, baseClass: string): Record<string, boolean> {
  return {
    [`${baseClass}--fixed`]: !!column.fixed,
    [`${baseClass}--fixed--start`]: column.id === lastFixedStartId.value,
    [`${baseClass}--fixed--end`]: column.id === firstFixedEndId.value,
  };
}

// Detect if @row-click listener is bound (for auto cursor-pointer)
const instance = getCurrentInstance();
const hasRowClickListener = computed(() => !!instance?.vnode.props?.onRowClick);

// Resolve row class from VcTable prop
function resolvedRowClass(item: T, index: number): unknown[] | undefined {
  let rowClassValue: unknown;
  if (props.rowClass) {
    rowClassValue = typeof props.rowClass === "function" ? props.rowClass(item, index) : props.rowClass;
  }
  const clickClass = hasRowClickListener.value ? "cursor-pointer" : undefined;

  if (!rowClassValue && !clickClass) {
    return undefined;
  }

  return [rowClassValue, clickClass];
}

// Resolve row style from VcTable prop
function resolvedRowStyle(item: T, index: number): string | Record<string, string> | undefined {
  if (!props.rowStyle) {
    return undefined;
  }

  if (typeof props.rowStyle === "function") {
    return props.rowStyle(item, index);
  }

  return props.rowStyle;
}

// Stable cell renderer — avoids creating a new functional component identity on every render
const CellRenderer = defineComponent({
  props: {
    slotFn: { type: Function as PropType<VcTableColumnSlotFnType>, default: undefined },
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },

  setup(p) {
    return () => p.slotFn?.({ item: p.item, index: p.index });
  },
});

// Stable header cell renderer for custom column header slots
const HeaderCellRenderer = defineComponent({
  props: {
    slotFn: { type: Function as PropType<VcTableColumnHeaderSlotFnType>, default: undefined },
    column: { type: Object as PropType<VcTableColumnType>, required: true },
  },

  setup(p) {
    return () => p.slotFn?.({ column: p.column });
  },
});

const breakpoints = useBreakpoints(BREAKPOINTS);
const isMobile = computed(() => {
  if (props.mobileBreakpoint === "none") {
    return false;
  }
  return breakpoints.smaller(props.mobileBreakpoint).value;
});

const scrollbarStyle = computed(() => {
  if (props.maxHeight) {
    return { "--vc-table-max-height": props.maxHeight };
  }
  return undefined;
});

const desktopBorderWidth = computed(() => (props.bordered ? "1px" : "0"));
const mobileBorderWidth = computed(() => (props.mobileBordered ? "1px" : "0"));

const desktopRadius = computed(() => (props.bordered ? "var(--radius)" : "0"));
const mobileRadius = computed(() => (props.mobileBordered ? "var(--radius)" : "0"));

function toggleSortDirection(currentDirection: VcTableSortDirectionType): VcTableSortDirectionType {
  return currentDirection === "desc" ? "asc" : "desc";
}

function getAriaSort(columnId: string): "ascending" | "descending" | "none" {
  if (!props.sort || props.sort.column !== columnId) {
    return "none";
  }

  return props.sort.direction === "asc" ? "ascending" : "descending";
}

/**
 * Gets a unique key for table row rendering.
 * Tries to use item.id if available, otherwise falls back to index.
 */
function getItemKey(item: T, index: number): string {
  const itemWithId = item as { id?: string | number };
  return String(itemWithId.id ?? index);
}
</script>

<style lang="scss">
.vc-table {
  $headSticky: "";

  @mixin column-align {
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

  @mixin fixed-column-separators {
    &--start {
      &::after {
        @apply pointer-events-none absolute inset-y-0 right-0 w-0.5 bg-neutral-300;

        content: "";
      }
    }

    &--end {
      &::before {
        @apply pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-neutral-300;

        content: "";
      }
    }
  }
  $row: "";
  $skeleton: "";

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

    max-height: var(--vc-table-max-height, none);
    border-style: solid;
    border-width: var(--desktop-border-width);
    border-radius: var(--desktop-radius);
  }

  &__desktop {
    @apply w-full text-left text-sm;

    &--scrollable {
      @apply w-auto min-w-full;
    }
  }

  &__caption {
    @apply sr-only;
  }

  &__head {
    @apply border-b border-neutral-200;

    &--sticky {
      $headSticky: &;

      @apply sticky z-20 bg-additional-50;

      top: var(--vc-table-sticky-offset, 0px);

      &::after {
        @apply pointer-events-none absolute inset-x-0 bottom-0 border-b border-neutral-200;

        content: "";
      }
    }
  }

  &__title {
    @apply px-4 py-1 h-10 font-bold;

    @include column-align;

    &--fixed {
      @apply bg-additional-50;

      #{$headSticky} & {
        z-index: 30;
      }

      @include fixed-column-separators;
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
    $row: &;

    &:nth-child(even) {
      @apply bg-neutral-50;
    }

    &:hover {
      @apply bg-neutral-200;
    }
  }

  &__skeleton {
    $skeleton: &;

    &:nth-child(even) {
      @apply bg-neutral-50;
    }
  }

  &__skeleton-cell {
    @apply px-4 py-3;

    @include column-align;

    &--fixed {
      @apply bg-additional-50;

      #{$skeleton}:nth-child(even) & {
        @apply bg-neutral-50;
      }

      @include fixed-column-separators;
    }
  }

  &__cell {
    @apply px-4 py-3;

    @include column-align;

    &--fixed {
      @apply bg-additional-50;

      #{$row}:nth-child(even) & {
        @apply bg-neutral-50;
      }

      #{$row}:hover & {
        @apply bg-neutral-200;
      }

      @include fixed-column-separators;
    }
  }

  &__skeleton-item {
    @apply h-6 animate-pulse bg-neutral-200;
  }

  &__sort-button {
    @apply inline-flex cursor-pointer items-center gap-2 p-1 -m-1 rounded;
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
