import type { Filters } from "./filtering";
import type { Sort } from "./sorting";

export interface ISearchOptions {
  sort: Sort[];
  filters?: Filters;
}
