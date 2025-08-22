export function isImage(htmlMarkup?: string): boolean {
  return !!htmlMarkup && htmlMarkup.length > 0 && htmlMarkup[0] === "!";
}
