import type { ISortInfo } from "@/core/types/search/sorting";

export function getSortingExpression(sort: ISortInfo): string {
  return `${sort.column}:${sort.direction}`;
}
