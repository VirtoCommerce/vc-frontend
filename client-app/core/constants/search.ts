import type { ISortInfo } from "../types";

export const DEFAULT_PAGE_SIZE = 16;
export const SORT_ASCENDING = "asc";
export const SORT_DESCENDING = "desc";
export const DEFAULT_SORT_INFO: ISortInfo = {
  column: "createdDate",
  direction: SORT_DESCENDING,
};
