export function getFilterExpression(filters: string[]): string {
  return filters.filter(Boolean).join(" ");
}
