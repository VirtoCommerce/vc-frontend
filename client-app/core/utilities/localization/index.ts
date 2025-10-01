import type { ILanguage } from "@/core/types/language";

export function tryShortLocale(localeOrCultureName: string, supportedLanguages: ILanguage[]) {
  const twoLetterLanguageName = localeOrCultureName.slice(0, 2);

  return supportedLanguages.filter((language) => language.twoLetterLanguageName === twoLetterLanguageName).length === 1
    ? twoLetterLanguageName
    : localeOrCultureName;
}
