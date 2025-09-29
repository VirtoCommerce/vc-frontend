import type { ILanguage } from "@/core/types/language";
import type { RouteLocationAsRelativeGeneric, RouteLocationRaw } from "vue-router";

export function updateRouteWithLocale(route: RouteLocationRaw, locale?: string | null) {
  // TODO: handle external links

  if (typeof route === "string") {
    // TODO: add locale to path
    return {
      path: route,
    };
  }

  const routeAsRelativeGeneric = route as RouteLocationAsRelativeGeneric;

  return {
    ...routeAsRelativeGeneric,
    params: {
      ...routeAsRelativeGeneric.params,
      locale: locale ?? "",
    },
  };
}

export function tryShortLocale(localeOrCultureName: string, supportedLanguages: ILanguage[]) {
  const twoLetterLanguageName = localeOrCultureName.slice(0, 2);

  const matchLanguages = supportedLanguages.filter(
    (language) => language.twoLetterLanguageName === twoLetterLanguageName,
  );

  const isUnique = matchLanguages.length === 1;

  return isUnique ? twoLetterLanguageName : localeOrCultureName;
}

/**
 * Matches: language[-region]
 *
 * language: 2–3 lowercase letters (ISO 639 codes, e.g. en, fr, ru)
 * region:   2 uppercase letters (ISO 3166, e.g. US, BR, PT, CN)
 *           or 3 digits (UN M.49, e.g. 001, 419)
 *
 * Notes:
 * - The outer parentheses are escaped (( ... \\)\\) in the pattern string
 *   as required by Vue Router: https://router.vuejs.org/guide/essentials/route-matching-syntax
 *
 * Examples:
 *   /en
 *   /fr
 *   /pt-BR
 *   /zh-419
 */
export const languageTagRegexPattern = "[a-z]{2,3}(?:-(?:[A-Z]{2}|\\d{3}\\)\\)?";
