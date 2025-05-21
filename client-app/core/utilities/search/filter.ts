/**
 * Combines an array of filter strings into a single filter expression.
 *
 * @param {string[]} filters - Array of filter strings to be combined
 * @returns {string} A single string with all non-empty filters joined by spaces
 * @example
 * getFilterExpression(['color:red', 'size:large']) // returns "color:red size:large"
 * getFilterExpression(['', 'status:active', null]) // returns "status:active"
 */
export function getFilterExpression(filters: string[]): string {
  return filters.filter(Boolean).join(" ");
}
