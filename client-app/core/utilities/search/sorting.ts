import type { ISortInfo } from "@/core/types/search/sorting";

/**
 * Converts a sort info object into a sorting expression string.
 *
 * @param {ISortInfo} sort - The sorting information containing column and direction
 * @returns {string} A string in the format "column:direction"
 * @example
 * getSortingExpression({ column: "price", direction: "desc" }) // returns "price:desc"
 */
export function getSortingExpression(sort: ISortInfo): string {
  return `${sort.column}:${sort.direction}`;
}
