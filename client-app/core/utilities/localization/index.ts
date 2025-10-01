import type { ILanguage } from "@/core/types/language";

export function tryShortLocale(localeOrCultureName: string, supportedLanguages: ILanguage[]) {
  const twoLetterLanguageName = localeOrCultureName.slice(0, 2);

  const matchLanguages = supportedLanguages.filter(
    (language) => language.twoLetterLanguageName === twoLetterLanguageName,
  );

  const isUnique = matchLanguages.length === 1;

  return isUnique ? twoLetterLanguageName : localeOrCultureName;
}
