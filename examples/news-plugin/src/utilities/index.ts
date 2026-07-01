export function isImage(htmlMarkup?: string): boolean {
  return !!(htmlMarkup?.startsWith("![") || htmlMarkup?.startsWith("<img"));
}
