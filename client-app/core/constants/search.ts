import { Sort } from "@/core/types/search/sorting";
import type { ISortInfo } from "@/core/types/search/sorting";

export const DEFAULT_PAGE_SIZE = 16;

export const PAGE_LIMIT = 100;

/**
 * @deprecated Use SortDirection.Ascending instead
 */
export const SORT_ASCENDING = "asc";
/**
 * @deprecated Use SortDirection.Descending instead
 */
export const SORT_DESCENDING = "desc";
/**
 * @deprecated Use DEFAULT_SORT instead
 */
export const DEFAULT_SORT_INFO: ISortInfo = {
  column: "createdDate",
  direction: SORT_DESCENDING,
};
export const DEFAULT_SORT = new Sort();
