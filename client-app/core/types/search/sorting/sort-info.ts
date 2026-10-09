export type SortDirectionType = "asc" | "desc";

export interface ISortInfo {
  column: string;
  direction: SortDirectionType;
}
