import { Filters } from "./filters";
import { Sort } from "./sorting";

export interface SearchParams {
  page: number;
  keyword: string;
  sort: Sort;
  filters?: Filters;
}
