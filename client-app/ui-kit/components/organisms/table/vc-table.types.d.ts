import type { Slot, StyleValue } from "vue";

declare global {
  type VcTableSortDirectionType = "asc" | "desc";
  type VcTableAlignType = "center" | "right" | "left";

  type VcTableColumnType = {
    id: string;
    title?: string;
    sortable?: boolean;
    align?: VcTableAlignType;
    classes?: string;
    /** Column width (e.g., "150px", "20%", "auto"). When set, enables table-layout: fixed for stable column widths. */
    width?: string;
  };

  type VcTableSortInfoType = {
    column: string;
    direction: VcTableSortDirectionType;
  };

  /**
   * Return type for the `rowProps` function prop on VcTable.
   * Allows consumers to apply dynamic class, style, and attributes to each row `<tr>`.
   */
  type VcTableRowPropsType = {
    class?: string | Record<string, boolean> | string[];
    style?: StyleValue;
    attrs?: Record<string, unknown>;
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
