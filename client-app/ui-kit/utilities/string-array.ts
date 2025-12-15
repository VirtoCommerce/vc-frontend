/**
 * Serializes string or array of strings to delimited string
 * @param value - String or array of strings to serialize
 * @returns Serialized string value (array joined by "|" or original string)
 */
export function serialize(value: string | string[]): string {
  return Array.isArray(value) ? value.join("|") : value;
}
