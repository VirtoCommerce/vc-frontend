import { SORT_ASCENDING, SORT_DESCENDING } from "@/core/constants/search";
import type { ISortInfo } from "@/core/types/search/sorting";

/**
 * @deprecated Use Sort.toString() instead
 */
export function getSortingExpression(sort: ISortInfo): string {
  return `${sort.column}:${sort.direction}`;
}

/**
 * @deprecated Use Sort.toggle() instead
 */
export function toggleSortDirection(currentDirection: string): string {
  return currentDirection === SORT_ASCENDING ? SORT_DESCENDING : SORT_ASCENDING;
}
