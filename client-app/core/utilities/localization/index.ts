import type { ILanguage } from "@/core/types/language";
import type { RouteLocationAsRelativeGeneric, RouteLocationRaw } from "vue-router";

export function updateRouteWithLocale(route: RouteLocationRaw, locale?: string) {
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
      locale: locale,
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
