/**
 * Mapping ISO 639-1 language codes (and culture codes) to ISO 3166-1 alpha-2 country codes
 * @see https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @see https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
 */
export const languageToCountryMap: Record<string, string> = {
  af: "za",
  ar: "sa",
  az: "az",
  be: "by",
  bg: "bg",
  bn: "bd",
  bs: "ba",
  ca: "es",
  cs: "cz",
  cy: "gb",
  da: "dk",
  de: "de",
  el: "gr",
  en: "us",
  "en-gb": "gb",
  es: "es",
  et: "ee",
  fa: "ir",
  fi: "fi",
  fil: "ph",
  fr: "fr",
  gu: "in",
  he: "il",
  hi: "in",
  hr: "hr",
  hu: "hu",
  hy: "am",
  id: "id",
  is: "is",
  it: "it",
  ja: "jp",
  ka: "ge",
  kk: "kz",
  km: "kh",
  kn: "in",
  ko: "kr",
  ky: "kg",
  lt: "lt",
  lv: "lv",
  mk: "mk",
  ml: "in",
  mn: "mn",
  mr: "in",
  ms: "my",
  mt: "mt",
  ne: "np",
  nl: "nl",
  no: "no",
  pa: "in",
  pl: "pl",
  pt: "pt",
  ro: "ro",
  ru: "ru",
  si: "lk",
  sk: "sk",
  sl: "si",
  sq: "al",
  sr: "rs",
  sv: "se",
  sw: "tz",
  ta: "in",
  te: "in",
  th: "th",
  tr: "tr",
  uk: "ua",
  ur: "pk",
  uz: "uz",
  vi: "vn",
  yo: "ng",
  zh: "cn",
  zu: "za",
};

export const FALLBACK_LOCALE = "en";
