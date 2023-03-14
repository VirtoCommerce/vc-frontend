import { DEFAULT_SORT_INFO, SORT_ASCENDING, SORT_DESCENDING } from "../../constants";
import type { ISortInfo } from "../../types";

export function getSortingExpression(sort: ISortInfo): string {
  return `${sort.column}:${sort.direction}`;
}

export function getSortInfoFromStringExpression(sortInfo: string): ISortInfo {
  const splitted: string[] = sortInfo.split(":");
  return splitted.length > 1
    ? {
        column: splitted[0],
        direction: splitted[1],
      }
    : DEFAULT_SORT_INFO;
}

export function toggleSortDirection(currentDirection: string): string {
  return currentDirection === SORT_ASCENDING ? SORT_DESCENDING : SORT_ASCENDING;
}
