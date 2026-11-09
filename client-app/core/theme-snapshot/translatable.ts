const CULTURE_KEY_REGEX = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i;

/** A dictionary has at least one culture name with a subtag, so a row such as `{ "sku": "X1" }` stays a row. */
const CULTURE_WITH_SUBTAG_REGEX = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})+$/i;

export function isTranslatableDictionary(value: unknown): value is Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const entries = Object.entries(value);

  return (
    entries.some(([key]) => CULTURE_WITH_SUBTAG_REGEX.test(key)) &&
    entries.every(([key, text]) => CULTURE_KEY_REGEX.test(key) && typeof text === "string")
  );
}

export function pickTranslation(
  dictionary: Record<string, string>,
  cultureName: string,
  defaultCultureName: string,
): string {
  const entries = Object.entries(dictionary);
  const language = languageOf(cultureName);
  const find = (matches: (key: string) => boolean) => entries.find(([key]) => matches(key.toLowerCase()))?.[1];

  return (
    find((key) => key === cultureName.toLowerCase()) ??
    find((key) => key === language) ??
    find((key) => languageOf(key) === language) ??
    find((key) => key === defaultCultureName.toLowerCase()) ??
    entries[0]?.[1] ??
    ""
  );
}

function languageOf(cultureName: string): string {
  return cultureName.split("-")[0].toLowerCase();
}

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
