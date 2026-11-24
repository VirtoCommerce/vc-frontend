import { getSlugInfo } from "@/core/api/graphql/slugInfo/queries/getSlugInfo";
import { useLanguages } from "@/core/composables/useLanguages";
import { languageToCountryMap } from "@/core/constants";
import { safeDecode } from "@/core/utilities/common";
import { useBroadcast } from "@/shared/broadcast/composables/useBroadcast";
import { dataChangedEvent } from "@/shared/broadcast/utils/events";
import type { ILanguage } from "@/core/types";

export function useLanguageSwitch() {
  const {
    supportedLanguages,
    pinLocale,
    removeLocaleFromUrl,
    currentLanguage,
    previousCultureSlug,
    getUrlWithoutLocale,
  } = useLanguages();
  const broadcast = useBroadcast();

  async function selectLanguage(cultureName: string): Promise<void> {
    pinLocale(cultureName);
    // Without the current locale prefix: slug resolvers match the permalink itself
    // (e.g. "veelgestelde-vragen", not "nl/veelgestelde-vragen").
    const permalink = getUrlWithoutLocale(location.pathname).slice(1);

    if (cultureName === currentLanguage.value?.cultureName) {
      return;
    }

    const slugInfo = await getSlugInfo({ permalink, cultureName });

    if (!slugInfo?.entityInfo) {
      // The current page may itself be shown through this fallback; keep the culture that owns the slug.
      const isShownThroughFallback =
        !!previousCultureSlug.value?.cultureName &&
        safeDecode(previousCultureSlug.value.slug) === safeDecode(permalink);

      previousCultureSlug.value = {
        cultureName: isShownThroughFallback
          ? previousCultureSlug.value.cultureName
          : currentLanguage.value?.cultureName,
        slug: permalink,
      };
    } else {
      previousCultureSlug.value = {
        cultureName: "",
        slug: "",
      };
    }

    removeLocaleFromUrl();
    void broadcast.emit(dataChangedEvent);
    location.reload();
  }

  function getCountryCode(language: ILanguage): string {
    return (
      languageToCountryMap[language.cultureName.toLocaleLowerCase()] ||
      languageToCountryMap[language.twoLetterLanguageName] ||
      "xx" // placeholder for unknown country
    );
  }

  // The native name without a region in ASCII brackets: "Deutsch (Deutschland)" → "Deutsch". Full-width brackets
  // stay: "中文（中国）".
  function getLanguageName(language: ILanguage): string {
    return language.nativeName.replace(/\([^()]*\)/g, "").trim();
  }

  return {
    currentLanguage,
    supportedLanguages,
    selectLanguage,
    getCountryCode,
    getLanguageName,
  };
}
