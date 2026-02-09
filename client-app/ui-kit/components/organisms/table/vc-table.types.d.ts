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
    /** Column width (e.g., "150px", "20%", "auto"). When set, enables table-layout: fixed for stable column widths. */
    width?: string;
  };

  type VcTableSortInfoType = {
    column: string;
    direction: VcTableSortDirectionType;
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
   * Internal column registration with slot
   */
  type VcTableColumnRegistrationType = {
    column: VcTableColumnType;
    slot?: VcTableColumnSlotFnType;
  };

  type VcTableContextType = {
    registerColumn: (column: VcTableColumnType, slot?: VcTableColumnSlotFnType) => void;
    unregisterColumn: (columnId: string) => void;
  };

  /**
   * Generic type constraint for table items
   * Items can have an optional id for keying
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  type VcTableItemType = {};
}

export {};
