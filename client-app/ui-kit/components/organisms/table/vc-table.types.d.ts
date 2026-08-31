import type { Slot } from "vue";

declare global {
  type VcTableSortDirectionType = "asc" | "desc";
  type VcTableAlignType = "center" | "right" | "left";

  type VcTableColumnType = {
    id: string;
    title?: string;
    sortable?: boolean;
    align?: VcTableAlignType;
    classes?: string;
    /** Column width (e.g., "150px"). When used with `fixed`, defaults to "150px" if not specified. */
    width?: string;
    /** Pins the column to the start or end edge. The column is automatically reordered to the corresponding edge of the table. Uses a default width of 150px if `width` is not specified. */
    fixed?: "start" | "end";
  };

  type VcTableSortInfoType = {
    column: string;
    direction: VcTableSortDirectionType;
  };

  type VcTableSelectionModeType = "single" | "multiple";

  /**
   * A row selection key. Accepted as `string | number` on input, but VcTable
   * normalizes keys to strings for all internal comparisons and emits them back
   * as strings (consistent with `getItemKey`, which stringifies `item.id`).
   */
  type VcTableSelectionKeyType = string | number;

  /**
   * Metadata describing what triggered a selection change.
   * - `select` / `deselect`: a single row was toggled (`row` is the affected row).
   * - `select-all` / `deselect-all`: the header control toggled all selectable rows on the current page.
   */
  type VcTableSelectionMetaType<T = unknown> = {
    action: "select" | "deselect" | "select-all" | "deselect-all";
    row?: T;
  };

  /**
   * Slot function type for rendering cell content
   * Receives the item and row index as scope
   */
  type VcTableColumnSlotScopeType<T = unknown> = {
    item: T;
    index: number;
  };

  type VcTableColumnSlotFnType = Slot<VcTableColumnSlotScopeType>;

  /**
   * Scope passed to the `#desktop-item` and `#mobile-item` slots.
   * The selection fields are always present; when selection is disabled,
   * `selected` is `false`, `selectable` is `true`, and `toggle` is a no-op.
   */
  type VcTableItemSlotScopeType<T = unknown> = {
    item: T;
    index: number;
    selected: boolean;
    toggle: () => void;
    selectable: boolean;
  };

  /**
   * Classes and inline style of the leading selection header cell. `v-bind` onto a `<th>`
   * to match the built-in cell; add your own classes with a sibling `class` attribute — in a
   * render function merge `class` yourself, since a spread would overwrite it.
   */
  type VcTableSelectionColumnAttrsType = {
    class: string;
    style: Record<string, string>;
  };

  /**
   * Classes of the built-in `<thead>`, sticky modifier included — the only carrier of the
   * header's sticky positioning. `v-bind` onto a custom `<thead>`; add your own classes the
   * way `VcTableSelectionColumnAttrsType` describes.
   */
  type VcTableHeadAttrsType = {
    class: string;
  };

  /**
   * Scope passed to the `#header` slot. A custom header replaces the default one entirely,
   * so it must render its own leading selection cell whenever `showSelectionColumn` is
   * `true`, or every column shifts by one. No per-column attributes are exposed: over
   * `fixed` columns the consumer reproduces the sticky offsets itself. See the
   * `SelectionCustomHeader` story.
   */
  type VcTableHeaderSlotScopeType = {
    showSelectionColumn: boolean;
    selectionMode?: VcTableSelectionModeType;
    isAllSelected: boolean;
    isSomeSelected: boolean;
    /** `false` when no row on the current page is selectable. */
    canSelectAll: boolean;
    toggleSelectAll: () => void;
    selectionColumnAttrs: VcTableSelectionColumnAttrsType;
    headAttrs: VcTableHeadAttrsType;
  };

  /**
   * Slot scope type for custom column header rendering.
   * Receives the column metadata.
   */
  type VcTableColumnHeaderSlotScopeType = {
    column: VcTableColumnType;
  };

  type VcTableColumnHeaderSlotFnType = Slot<VcTableColumnHeaderSlotScopeType>;

  /**
   * Internal column registration with slot
   */
  type VcTableColumnRegistrationType = {
    column: VcTableColumnType;
    slot?: VcTableColumnSlotFnType;
    headerSlot?: VcTableColumnHeaderSlotFnType;
  };

  type VcTableContextType = {
    registerColumn: (
      column: VcTableColumnType,
      slot?: VcTableColumnSlotFnType,
      headerSlot?: VcTableColumnHeaderSlotFnType,
    ) => void;
    unregisterColumn: (columnId: string) => void;
  };
}

export {};
