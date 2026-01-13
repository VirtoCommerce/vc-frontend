declare global {
  type VcTableSortDirectionType = "asc" | "desc";
  type VcTableAlignType = "center" | "right" | "left";

  type VcTableColumnType = {
    id: string;
    title?: string;
    sortable?: boolean;
    align?: VcTableAlignType;
    classes?: string;
  };

  type VcTableSortInfoType = {
    column: string;
    direction: VcTableSortDirectionType;
  };
}

export {};
