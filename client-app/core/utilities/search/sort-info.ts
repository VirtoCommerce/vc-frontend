import { ISortInfo, Sort, SortDirection } from "@/core";

/**
 * @deprecated Use Sort.toString() instead
 */
export function getSortingExpression(sort: ISortInfo): string {
  const { fieldName, direction } = sort;
  return new Sort(fieldName, direction as SortDirection).toString();
}

/**
 * @deprecated Use Sort.fromString() instead
 */
export function getSortInfoFromStringExpression(sortInfo: string): ISortInfo {
  return Sort.fromString(sortInfo);
}

/**
 * @deprecated Use SortDirection.togle() instead
 */
export function toggleSortDirection(currentDirection: string): string {
  return SortDirection.toggle(currentDirection as SortDirection);
}
