/** A language key of a translatable dictionary: `en`, `en-US`. */
const CULTURE_KEY_REGEX = /^[a-z]{2}(?:-[A-Za-z]{2,4})?$/;

/**
 * Whether a setting value is a translatable dictionary ("language → text"), as the designer's draft may hold one.
 * A published snapshot never does: the module resolves the texts of each language when it publishes.
 */
export function isTranslatableDictionary(value: unknown): value is Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const entries = Object.entries(value);

  return entries.length > 0 && entries.every(([key, text]) => CULTURE_KEY_REGEX.test(key) && typeof text === "string");
}

/** The text of a dictionary in the language: else in the store default language, else its first text. */
export function pickTranslation(
  dictionary: Record<string, string>,
  cultureName: string,
  defaultCultureName: string,
): string {
  return dictionary[cultureName] ?? dictionary[defaultCultureName] ?? Object.values(dictionary)[0] ?? "";
}

/** Replaces every translatable dictionary inside the value with its text in the language. */
export function resolveTranslatableValues<T>(value: T, cultureName: string, defaultCultureName: string): T {
  if (isTranslatableDictionary(value)) {
    return pickTranslation(value, cultureName, defaultCultureName) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item: unknown) => resolveTranslatableValues(item, cultureName, defaultCultureName)) as T;
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        resolveTranslatableValues(item, cultureName, defaultCultureName),
      ]),
    ) as T;
  }

  return value;
}
