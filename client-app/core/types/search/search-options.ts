import { Filters } from "./filters";
import { Sort } from "./sorting";

export interface SearchOptions {
  sort: Sort[];
  filters?: Filters;
}
