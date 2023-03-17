import type { Filters } from "./filtering";
import type { Sort } from "./sorting";

export interface ISearchParams {
  page: number;
  keyword: string;
  sort: Sort;
  filters?: Filters;
}
