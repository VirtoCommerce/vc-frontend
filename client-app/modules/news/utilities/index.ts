export function isImage(htmlMarkup?: string): boolean {
  return !!htmlMarkup && htmlMarkup.startsWith("!");
}
