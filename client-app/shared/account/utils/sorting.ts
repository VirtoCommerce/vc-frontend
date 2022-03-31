import { ISortInfo } from "@/shared/account";

export function getSortingExpression(sort: ISortInfo): string {
  return `${sort.column}:${sort.direction}`;
}
