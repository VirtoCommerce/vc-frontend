import { Sort } from "@/core/types/search/sorting";
import type { Filter, Filters } from "@/core/types/search/filtering";
import type { ISortInfo } from "@/core/types/search/sorting";

export const DEFAULT_PAGE_SIZE = 16;
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGES = 1;
export const DEFAULT_KEYWORD = "";
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
export const DEFAULT_FILTER: Filter | undefined = undefined;
export const DEFAULT_FILTERS: Filters | undefined = undefined;
export const DEFAULT_ITEMS = [];
