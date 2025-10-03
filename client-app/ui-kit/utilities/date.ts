export function toDateOnlyString(isoDate?: string): string | undefined {
  if (!isoDate) {
    return undefined;
  }
  return isoDate.split("T")[0];
}
