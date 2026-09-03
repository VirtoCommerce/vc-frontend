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

      <!-- Error before empty: a failed request with empty items still shows the error -->
      <template v-else-if="error">
        <slot name="error">
          <DefaultErrorState />
        </slot>
      </template>

      <!-- Mobile empty view -->
      <template v-else-if="!items.length">
        <slot v-if="$slots['mobile-empty']" name="mobile-empty" />

        <VcEmptyView v-else variant="search" :text="$t('ui_kit.table.empty')" />
      </template>

      <!-- Mobile item view -->
      <slot
        v-else
        v-for="(item, index) in items"
        :key="getItemKey(item, index)"
        name="mobile-item"
        :item="item"
        :index="index"
        v-bind="selectionSlotScope(item, index)"
      />
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
      <table ref="desktopTableRef" :class="['vc-table__desktop', { 'vc-table__desktop--scrollable': scrollable }]">
        <caption v-if="description" class="vc-table__caption">
          {{
            description
          }}
        </caption>

        <slot name="header" v-bind="headerSlotScope">
          <thead v-if="!hideDefaultHeader && orderedColumns.length" v-bind="headAttrs">
            <tr class="vc-table__head-row">
              <th v-if="showSelectionColumn" scope="col" v-bind="selectionColumnAttrs">
                <VcCheckbox
                  v-if="selectionMode === 'multiple'"
                  size="sm"
                  :model-value="isAllSelected"
                  :indeterminate="isSomeSelected"
                  :disabled="!canSelectAll"
                  :aria-label="$t(isAllSelected ? 'ui_kit.table.deselect_all' : 'ui_kit.table.select_all')"
                  @change="toggleSelectAll"
                />

                <span v-else class="sr-only">{{ $t("ui_kit.table.selection_column") }}</span>
              </th>

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
                <HeaderCellRenderer v-if="column.headerSlotFn" :slot-fn="column.headerSlotFn" :column="column" />

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
                v-if="showSelectionColumn"
                :class="[
                  'vc-table__skeleton-cell',
                  'vc-table__selection-cell',
                  { 'vc-table__skeleton-cell--fixed': selectionColumnSticky },
                ]"
                :style="selectionColumnStyle"
              >
                <div class="vc-table__selection-skeleton" />
              </td>

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

        <!-- Error before empty: a failed request with empty items still shows the error -->
        <tbody v-else-if="error" class="vc-table__body">
          <tr>
            <td :colspan="stateColspan" class="vc-table__state-cell">
              <slot name="error">
                <DefaultErrorState />
              </slot>
            </td>
          </tr>
        </tbody>

        <!-- Desktop empty view -->
        <tbody v-else-if="!items.length" class="vc-table__body">
          <slot v-if="$slots['desktop-empty']" name="desktop-empty" />

          <tr v-else>
            <td :colspan="stateColspan" class="vc-table__state-cell">
              <VcEmptyView variant="search" :text="$t('ui_kit.table.empty')" />
            </td>
          </tr>
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
            :ref="(el) => setRowRef(el as Element | null, rowIndex)"
            :class="[
              'vc-table__row',
              { 'vc-table__row--selected': selectionEnabled && isRowSelected(item, rowIndex) },
              resolvedRowClass(item, rowIndex),
            ]"
            :style="resolvedRowStyle(item, rowIndex)"
            :tabindex="rowTabindex(rowIndex)"
            :role="!selectionEnabled && hasRowClickListener ? 'button' : undefined"
            :aria-selected="selectionEnabled ? isRowSelected(item, rowIndex) : undefined"
            @click="hasRowClickListener && $emit('rowClick', item, rowIndex)"
            @focusin="activeRowIndex = rowIndex"
            @keydown="onRowKeydown($event, item, rowIndex)"
          >
            <td
              v-if="showSelectionColumn"
              :class="[
                'vc-table__cell',
                'vc-table__selection-cell',
                { 'vc-table__cell--fixed': selectionColumnSticky },
              ]"
              :style="selectionColumnStyle"
              @click.stop
              @keydown.enter.stop
            >
              <VcCheckbox
                v-if="selectionMode === 'multiple'"
                size="sm"
                tabindex="-1"
                :model-value="isRowSelected(item, rowIndex)"
                :disabled="!canSelectRow(item) && !isRowSelected(item, rowIndex)"
                :aria-label="rowSelectionAriaLabel(item, rowIndex)"
                @change="toggleRow(item, rowIndex)"
              />

              <!--
                Toggle on `click`, not `change`: a native radio's `change` never fires when
                re-clicking the already-checked radio, so `@change` could select but never
                deselect by mouse. The overlay input covers the control, so exactly one click
                fires; keyboard toggling is handled by the row's `onRowKeydown`.
              -->
              <VcRadioButton
                v-else
                size="sm"
                :tabindex="-1"
                :name="`sel-${tableId}-${getItemKey(item, rowIndex)}`"
                :value="getItemKey(item, rowIndex)"
                :model-value="isRowSelected(item, rowIndex) ? getItemKey(item, rowIndex) : undefined"
                :disabled="!canSelectRow(item) && !isRowSelected(item, rowIndex)"
                :aria-label="rowSelectionAriaLabel(item, rowIndex)"
                @click="toggleRow(item, rowIndex)"
              />
            </td>

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
              <CellRenderer v-if="column.slotFn" :slot-fn="column.slotFn" :item="item" :index="rowIndex" />
            </td>
          </tr>
        </tbody>

        <!-- Desktop table item view -->
        <tbody v-else-if="items.length && $slots['desktop-item']" class="vc-table__body">
          <slot
            v-for="(item, index) in items"
            :key="getItemKey(item, index)"
            name="desktop-item"
            :item="item"
            :index="index"
            v-bind="selectionSlotScope(item, index)"
          />
        </tbody>
      </table>
    </VcScrollbar>

    <!-- Table footer -->
    <slot name="footer">
      <div class="vc-table__footer">
        <div v-if="!error && pageLimit && page >= pageLimit" class="vc-table__page-limit-message">
          <slot name="page-limit-message">
            {{ $t("ui_kit.reach_limit.page_limit") }}
          </slot>
        </div>

        <VcPagination
          v-if="!hideDefaultFooter && !error && items.length && pages > 1"
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
import {
  computed,
  defineComponent,
  Fragment,
  getCurrentInstance,
  h,
  nextTick,
  normalizeClass,
  onMounted,
  onUpdated,
  provide,
  ref,
  useSlots,
  useTemplateRef,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import { useComponentId } from "@/ui-kit/composables";
import { BREAKPOINTS, TABLE_SKELETON_ROWS_SIZE, TABLE_PAGE_LIMIT } from "@/ui-kit/constants";
import VcTableColumn from "./vc-table-column.vue";
import { vcTableKey } from "./vc-table-context";
import type { PropType, VNode } from "vue";
import VcCheckbox from "@/ui-kit/components/atoms/checkbox/vc-checkbox.vue";
import VcRadioButton from "@/ui-kit/components/atoms/radio-button/vc-radio-button.vue";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";
import VcEmptyView from "@/ui-kit/components/molecules/empty-view/vc-empty-view.vue";

const emit = defineEmits<{
  (event: "headerClick", item: VcTableSortInfoType): void;
  (event: "pageChanged", page: number): void;
  (event: "rowClick", item: T, index: number): void;
  (event: "retry"): void;
  /** Emitted keys are always strings (normalized from `getItemKey`), even if numeric keys were passed in. */
  (event: "update:selection", keys: VcTableSelectionKeyType[]): void;
  /** Emitted keys are always strings (normalized from `getItemKey`), even if numeric keys were passed in. */
  (event: "selectionChange", keys: VcTableSelectionKeyType[], rows: T[], meta: VcTableSelectionMetaType<T>): void;
}>();

const props = withDefaults(
  defineProps<{
    columns?: VcTableColumnType[];
    items?: T[];
    sort?: VcTableSortInfoType;
    pages?: number;
    page?: number;
    loading?: boolean;
    error?: boolean;
    /** Hides the built-in header row; body rows keep their selection cell, but the select-all goes with the header. */
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
    /**
     * Row selection mode. `"single"` = radio, at most one row; `"multiple"` = checkboxes
     * with a header select-all. `undefined` disables selection.
     */
    selectionMode?: VcTableSelectionModeType;
    /**
     * Selected row keys (v-model:selection). Parent-owned, so selection persists across
     * `items`/page/sort/filter changes. Accepts `string | number` keys but compares them
     * as strings (matching `getItemKey`), so numeric `[1, 2]` still matches `id: 1` / `id: 2`.
     * Rows without an `id` are keyed `__row_<index>` — give items an `id` for stable selection.
     */
    selection?: VcTableSelectionKeyType[];
    /** Predicate: rows returning `false` get a disabled control and are excluded from select-all. */
    isRowSelectable?: (item: T) => boolean;
    /** Custom accessible label for a row's selection control; falls back to "Select row N". */
    rowSelectionLabel?: (item: T, index: number) => string;
  }>(),
  {
    columns: () => [],
    items: () => [],
    pages: 0,
    page: 0,
    pageLimit: TABLE_PAGE_LIMIT,
    mobileBreakpoint: "md",
    skeletonRows: TABLE_SKELETON_ROWS_SIZE,
    selection: () => [],
  },
);

const { t } = useI18n();

const FIXED_COLUMN_DEFAULT_WIDTH = "150px";
const SELECTION_COLUMN_WIDTH = "3rem";

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
  return [...registrations].sort((a, b) => {
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

  // Start offsets. When the selection column is sticky (there is at least one
  // fixed-start column), it occupies the leading start slot, so seed the widths
  // with its width to shift subsequent fixed-start columns.
  const startWidths: string[] = selectionColumnSticky.value ? [SELECTION_COLUMN_WIDTH] : [];
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

// Reorder columns: fixed-start → normal → fixed-end, and attach resolved slots
// per column to avoid repeated Map lookups in the template (header + each cell).
// This ensures fixed columns are always at the edges, regardless of template order.
const orderedColumns = computed<
  Array<VcTableColumnType & { slotFn?: VcTableColumnSlotFnType; headerSlotFn?: VcTableColumnHeaderSlotFnType }>
>(() => {
  const withSlots = mergedColumns.value.map((col) => {
    const reg = childColumns.value.get(col.id);
    return { ...col, slotFn: reg?.slot, headerSlotFn: reg?.headerSlot };
  });
  const start = withSlots.filter((col) => col.fixed === "start");
  const center = withSlots.filter((col) => !col.fixed);
  const end = withSlots.filter((col) => col.fixed === "end");
  return [...start, ...center, ...end];
});

// Detect edge fixed columns for shadow rendering
const lastFixedStartId = computed<string | undefined>(() => {
  const cols = orderedColumns.value.filter((col) => col.fixed === "start");
  return cols.length ? cols[cols.length - 1].id : undefined;
});

// The selection column becomes sticky-start only when the table already has
// fixed-start columns, so it stays visible during horizontal scroll alongside them.
const hasFixedStartColumn = computed<boolean>(() => orderedColumns.value.some((col) => col.fixed === "start"));
const selectionColumnSticky = computed<boolean>(() => showSelectionColumn.value && hasFixedStartColumn.value);

// Inline style for the leading selection column cell/header.
const selectionColumnStyle = computed<Record<string, string>>(() => {
  const base: Record<string, string> = {
    width: SELECTION_COLUMN_WIDTH,
    minWidth: SELECTION_COLUMN_WIDTH,
    maxWidth: SELECTION_COLUMN_WIDTH,
  };
  if (selectionColumnSticky.value) {
    return { ...base, position: "sticky", insetInlineStart: "0px", zIndex: "3" };
  }
  return base;
});

// Shared with the `#header` slot scope. String class, not an array: a bare `v-bind` would
// normalize `class` in place and rewrite this computed's cache.
const headAttrs = computed<VcTableHeadAttrsType>(() => ({
  class: normalizeClass(["vc-table__head", { "vc-table__head--sticky": props.stickyHeader || props.maxHeight }]),
}));

// Shared with the `#header` slot scope. The style is a copy: the same object also styles
// the body cells.
const selectionColumnAttrs = computed<VcTableSelectionColumnAttrsType>(() => ({
  class: normalizeClass([
    "vc-table__title",
    "vc-table__selection-cell",
    { "vc-table__title--fixed": selectionColumnSticky.value },
  ]),
  style: { ...selectionColumnStyle.value },
}));

// Colspan for full-width state cells (empty/error), including the selection column.
const stateColspan = computed<number>(() => orderedColumns.value.length + (showSelectionColumn.value ? 1 : 0));

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

// Detect if @row-click listener is bound (for auto cursor-pointer).
// instance.vnode is non-reactive, so we manually refresh on mount/update to track parent re-renders
// (covers the case where parent dynamically adds/removes the listener).
const instance = getCurrentInstance();
const hasRowClickListener = ref(false);
const hasRetryListener = ref(false);

function syncRowClickListener() {
  hasRowClickListener.value = !!instance?.vnode.props?.onRowClick;
}

function syncRetryListener() {
  hasRetryListener.value = !!instance?.vnode.props?.onRetry;
}

const desktopTableRef = useTemplateRef<HTMLTableElement | null>("desktopTableRef");
let headerAlignmentWarned = false;
let headerTheadWarned = false;

function warnOnCustomHeaderIssues(): void {
  const table = desktopTableRef.value;

  if (!table) {
    return;
  }

  // Vue appends bare `<tr>`s straight to the table instead of foster-parenting them, so
  // `headAttrs` lands nowhere and the alignment check below cannot run either.
  if (!table.querySelector(":scope > thead")) {
    if (!headerTheadWarned && table.querySelector(":scope > tr")) {
      headerTheadWarned = true;

      // eslint-disable-next-line no-console
      console.warn(
        "VcTable: the `#header` slot must wrap its rows in a `<thead>`. Bare `<tr>`s get no sticky positioning from `headAttrs`, and the header/body alignment check is skipped.",
      );
    }

    return;
  }

  // Only the default skeleton and the VcTableColumn rows inject selection cells.
  const bodyHasSelectionCell = props.loading ? !slots["desktop-skeleton"] : hasColumnSlots.value;

  if (headerAlignmentWarned || !showSelectionColumn.value || !bodyHasSelectionCell) {
    return;
  }

  // Direct descendants only: column slots render consumer content, a nested table included.
  const rows = table.querySelectorAll<HTMLTableRowElement>(":scope > thead > tr");

  if (!rows.length) {
    return;
  }

  // Widest row wins: a grouped header spreads its columns over several rows.
  const renderedColumns = Math.max(
    ...[...rows].map((row) => [...row.cells].reduce((total, cell) => total + cell.colSpan, 0)),
  );

  // Only a one-cell shortfall is reported; any other shape is a deliberate layout.
  if (!renderedColumns || renderedColumns !== stateColspan.value - 1) {
    return;
  }

  headerAlignmentWarned = true;

  // eslint-disable-next-line no-console
  console.warn(
    "VcTable: the custom `#header` renders one cell fewer than the body rows. Either the selection cell was dropped — the `#header` slot replaces the default header, selection cell included, while body rows keep theirs; render a selection `<th>` from the slot scope (`showSelectionColumn`, `selectionColumnAttrs`, `toggleSelectAll`, …) — or a data column has no header cell, or a multi-row header heads a column only in its lower row. Ignore this if the shape is deliberate.",
  );
}

onMounted(() => {
  syncRowClickListener();
  syncRetryListener();

  if (import.meta.env.DEV && selectionEnabled.value && slots["desktop-body"]) {
    // eslint-disable-next-line no-console
    console.warn(
      "VcTable: `selectionMode` is not supported with the `#desktop-body` slot — the component can't inject a selection cell per row. Use `#desktop-item` (exposes `selected`/`toggle`/`selectable`) or VcTableColumn slots for row selection.",
    );
  }

  if (import.meta.env.DEV && slots.header) {
    // columns register on child mount, so the header renders a tick later
    void nextTick(warnOnCustomHeaderIssues);
  }
});

onUpdated(() => {
  syncRowClickListener();
  syncRetryListener();

  // Columns, selection and the desktop table itself can all appear after mount.
  if (import.meta.env.DEV && slots.header) {
    warnOnCustomHeaderIssues();
  }
});

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

// Default error state, shared between the desktop (table cell) and mobile branches
// so the markup isn't duplicated. The consumer-provided `#error` slot overrides this in both.
const DefaultErrorState = defineComponent({
  setup() {
    return () =>
      h(
        VcEmptyView,
        { variant: "error", text: t("ui_kit.table.error") },
        hasRetryListener.value
          ? {
              button: () =>
                h(VcButton, { variant: "outline", color: "secondary", onClick: () => emit("retry") }, () =>
                  t("ui_kit.table.retry"),
                ),
            }
          : undefined,
      );
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
  // Prefixed so an id-less row cannot collide with another row's `id` (`{ id: "1" }` + a
  // sibling without one at index 1 selected both).
  return String(itemWithId.id ?? `__row_${index}`);
}

const tableId = useComponentId("vc-table");

// -----------------------------------------------------------------------------
// Row selection
// -----------------------------------------------------------------------------

const selectionEnabled = computed<boolean>(() => props.selectionMode !== undefined);

const showSelectionColumn = computed<boolean>(() => selectionEnabled.value && !slots["desktop-body"]);

// Normalize to strings so comparisons match `getItemKey`, even for numeric input keys.
const selectionSet = computed<Set<string>>(() => new Set(props.selection.map(String)));

function canSelectRow(item: T): boolean {
  return props.isRowSelectable ? props.isRowSelectable(item) : true;
}

function isRowSelected(item: T, index: number): boolean {
  return selectionSet.value.has(getItemKey(item, index));
}

// Selectable keys among current items; drives select-all.
const selectableKeysOnPage = computed<string[]>(() => {
  const keys: string[] = [];
  props.items.forEach((item, index) => {
    if (canSelectRow(item)) {
      keys.push(getItemKey(item, index));
    }
  });
  return keys;
});

const selectedCountOnPage = computed<number>(() => {
  return selectableKeysOnPage.value.filter((key) => selectionSet.value.has(key)).length;
});

const canSelectAll = computed<boolean>(() => selectableKeysOnPage.value.length > 0);

const isAllSelected = computed<boolean>(() => {
  return canSelectAll.value && selectedCountOnPage.value === selectableKeysOnPage.value.length;
});

const isSomeSelected = computed<boolean>(() => {
  return selectedCountOnPage.value > 0 && !isAllSelected.value;
});

// Resolve selected rows among current `items` only; off-page selections aren't present here.
function resolveRows(keys: VcTableSelectionKeyType[]): T[] {
  const wanted = new Set(keys);
  const rows: T[] = [];
  props.items.forEach((item, index) => {
    if (wanted.has(getItemKey(item, index))) {
      rows.push(item);
    }
  });
  return rows;
}

function commitSelection(keys: VcTableSelectionKeyType[], meta: VcTableSelectionMetaType<T>): void {
  emit("update:selection", keys);
  emit("selectionChange", keys, resolveRows(keys), meta);
}

function toggleRow(item: T, index: number): void {
  // Slot scope exposes `toggle` even when selection is off; calling it must be a no-op.
  if (!selectionEnabled.value) {
    return;
  }

  const key = getItemKey(item, index);
  const alreadySelected = selectionSet.value.has(key);

  // gate ADD only — deselect must always work, never trap a row
  if (!alreadySelected && !canSelectRow(item)) {
    return;
  }

  if (props.selectionMode === "single") {
    const keys = alreadySelected ? [] : [key];
    commitSelection(keys, { action: alreadySelected ? "deselect" : "select", row: item });
    return;
  }

  // multiple; normalize so the string `key` matches numeric input keys
  const keys = props.selection.map(String);
  const existingIndex = keys.indexOf(key);
  if (existingIndex === -1) {
    keys.push(key);
    commitSelection(keys, { action: "select", row: item });
  } else {
    keys.splice(existingIndex, 1);
    commitSelection(keys, { action: "deselect", row: item });
  }
}

function toggleSelectAll(): void {
  // Slot scope exposes `toggleSelectAll` in every mode; only `multiple` has a select-all.
  if (props.selectionMode !== "multiple") {
    return;
  }

  if (isAllSelected.value) {
    // clear all page keys (incl. stuck non-selectable), keep off-page
    const pageKeySet = new Set(props.items.map((item, index) => getItemKey(item, index)));
    const keys = props.selection.map(String).filter((key) => !pageKeySet.has(key));
    commitSelection(keys, { action: "deselect-all" });
  } else {
    // Dedup: two items can share a key, and `toggleRow` splices a single occurrence.
    const added = [...new Set(selectableKeysOnPage.value)].filter((key) => !selectionSet.value.has(key));

    // No selectable row on this page: committing would emit a `select-all` that changed nothing.
    if (!added.length) {
      return;
    }

    commitSelection([...props.selection.map(String), ...added], { action: "select-all" });
  }
}

const headerSlotScope = computed<VcTableHeaderSlotScopeType>(() => ({
  showSelectionColumn: showSelectionColumn.value,
  selectionMode: props.selectionMode,
  isAllSelected: isAllSelected.value,
  isSomeSelected: isSomeSelected.value,
  canSelectAll: canSelectAll.value,
  toggleSelectAll,
  selectionColumnAttrs: selectionColumnAttrs.value,
  headAttrs: headAttrs.value,
}));

// Scope helpers exposed to #desktop-item / #mobile-item slots.
function selectionSlotScope(
  item: T,
  index: number,
): {
  selected: boolean;
  toggle: () => void;
  selectable: boolean;
} {
  return {
    selected: isRowSelected(item, index),
    toggle: () => toggleRow(item, index),
    selectable: canSelectRow(item),
  };
}

// -----------------------------------------------------------------------------
// Roving-tabindex keyboard navigation for built-in selectable rows.
// Arrows move focus only; Space/Enter commit the selection.
// -----------------------------------------------------------------------------

const activeRowIndex = ref(0);
const rowRefs = ref<(HTMLTableRowElement | null)[]>([]);

function setRowRef(el: Element | null, index: number): void {
  rowRefs.value[index] = el as HTMLTableRowElement | null;
}

function rowTabindex(index: number): number | undefined {
  if (selectionEnabled.value) {
    return index === activeRowIndex.value ? 0 : -1;
  }
  return hasRowClickListener.value ? 0 : undefined;
}

function rowSelectionAriaLabel(item: T, index: number): string {
  return props.rowSelectionLabel?.(item, index) ?? t("ui_kit.table.select_row_number", { number: index + 1 });
}

function focusRow(index: number): void {
  const max = props.items.length - 1;
  if (max < 0) {
    return;
  }
  const clamped = Math.min(Math.max(index, 0), max);
  activeRowIndex.value = clamped;
  void nextTick(() => {
    rowRefs.value[clamped]?.focus();
  });
}

function onRowKeydown(event: KeyboardEvent, item: T, index: number): void {
  if (!selectionEnabled.value) {
    // rowClick-only rows keep their original Enter behavior.
    if (event.key === "Enter" && hasRowClickListener.value) {
      emit("rowClick", item, index);
    }
    return;
  }

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      if (index < props.items.length - 1) {
        focusRow(index + 1);
      }
      break;
    case "ArrowUp":
      event.preventDefault();
      if (index > 0) {
        focusRow(index - 1);
      }
      break;
    case "Home":
      event.preventDefault();
      focusRow(0);
      break;
    case "End":
      event.preventDefault();
      focusRow(props.items.length - 1);
      break;
    case " ":
    case "Spacebar":
      event.preventDefault();
      toggleRow(item, index);
      break;
    case "Enter":
      event.preventDefault();
      if (hasRowClickListener.value) {
        emit("rowClick", item, index);
      } else {
        toggleRow(item, index);
      }
      break;
  }
}

watch(
  () => props.items,
  () => {
    activeRowIndex.value = 0;
  },
);
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
  // Selected-row highlight, declared once — the dark layer varies only the alpha.
  // `--vc-table-selected-bg` is the previous public name, still honored for forks.
  --selected-bg-alpha: 0.08;
  --selected-bg-color: var(
    --vc-table-selected-bg-color,
    var(--vc-table-selected-bg, rgb(from var(--color-primary-500) r g b / var(--selected-bg-alpha)))
  );
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
    $selected: "";

    &:nth-child(even) {
      @apply bg-neutral-50;
    }

    &:hover {
      @apply bg-neutral-200;
    }

    &--selected {
      $selected: &;

      // Compound selectors so the highlight wins over the zebra/hover backgrounds.
      &,
      &:nth-child(even),
      &:hover {
        background-color: var(--selected-bg-color);
      }
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

      // Keep the highlight on sticky (opaque) cells of a selected row.
      .vc-table__row--selected & {
        background-color: var(--selected-bg-color);
      }

      @include fixed-column-separators;
    }
  }

  &__selection-cell {
    @apply px-3;

    // Center the control and collapse its box so it doesn't stretch the row height.
    > .vc-checkbox,
    > .vc-radio-button {
      @apply mx-auto flex w-fit items-center justify-center;

      // line-height:0 removes the control's phantom baseline descent that would stretch the row.
      line-height: 0;

      // Empty label span must not reserve vertical space.
      .vc-checkbox__label,
      .vc-radio-button__label {
        @apply min-h-0 leading-none;
      }
    }

    > .vc-checkbox > .vc-checkbox__container,
    > .vc-radio-button > .vc-radio-button__container {
      @apply items-center leading-none;
    }
  }

  &__selection-skeleton {
    @apply mx-auto size-[1.125rem] animate-pulse rounded bg-neutral-200;
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

  &__state-cell {
    @apply p-0;
  }

  &__footer {
    @apply px-3 py-10 empty:hidden md:px-5 md:pb-5;
  }

  &__page-limit-message {
    @apply mb-3 text-center;
  }
}
</style>
