import { useLanguages } from "@/core/composables/useLanguages";
import { FALLBACK_LOCALE } from "@/core/constants";
import { Logger } from "@/core/utilities";
import type { I18n } from "@/i18n";
import type { LocaleMessageValue } from "vue-i18n";

export async function loadModuleLocale(i18n: I18n, moduleName: string): Promise<void> {
  const { currentLanguage, mergeLocales } = useLanguages();
  const locale = currentLanguage.value?.twoLetterLanguageName || FALLBACK_LOCALE;

  try {
    const [moduleFallbackMessages, moduleMessages] = await Promise.all<LocaleMessageValue[]>([
      locale !== FALLBACK_LOCALE
        ? import(`./${moduleName}/locales/${FALLBACK_LOCALE}.json`).catch((error) => {
            Logger.error(`Fallback locale: ${FALLBACK_LOCALE} for the module ${moduleName} not found`, error);

            return {};
          })
        : Promise.resolve({}),
      import(`./${moduleName}/locales/${locale}.json`).catch((error) => {
        Logger.error(`Locale: ${locale} for the module ${moduleName} not found`, error);

        return {};
      }),
    ]);

    mergeLocales(i18n, locale, moduleMessages);

    if (locale !== FALLBACK_LOCALE) {
      mergeLocales(i18n, FALLBACK_LOCALE, moduleFallbackMessages);
    }
  } catch (error) {
    Logger.error(`Error loading the ${moduleName} module locale: "${locale}"`);
  }
}
