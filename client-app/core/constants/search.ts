import { Filter, Filters, Sort, SortDirection } from "../types";

export const DEFAULT_PAGE_SIZE = 16;
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGES = 1;
export const DEFAULT_KEYWORD = "";
export const DEFAULT_SORT: Sort = new Sort("createdDate", SortDirection.Descending);
export const DEFAULT_FILTER: Filter | undefined = undefined;
export const DEFAULT_FILTERS: Filters | undefined = undefined;
export const DEFAULT_ITEMS = [];
