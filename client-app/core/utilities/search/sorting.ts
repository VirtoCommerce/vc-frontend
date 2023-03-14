import { DEFAULT_SORT_INFO, SORT_ASCENDING, SORT_DESCENDING } from "../../constants";
import type { ISortInfo } from "../../types";

/**
 * @deprecated Use Sort.toString() instead
 */
export function getSortingExpression(sort: ISortInfo): string {
  return `${sort.column}:${sort.direction}`;
}

/**
 * @deprecated Use Sort.fromString() instead
 */
export function getSortInfoFromStringExpression(sortInfo: string): ISortInfo {
  const splitted: string[] = sortInfo.split(":");
  return splitted.length > 1
    ? {
        column: splitted[0],
        direction: splitted[1],
      }
    : DEFAULT_SORT_INFO;
}

/**
 * @deprecated Use SortDirection.togle() instead
 */
export function toggleSortDirection(currentDirection: string): string {
  return currentDirection === SORT_ASCENDING ? SORT_DESCENDING : SORT_ASCENDING;
}
