import { useLanguages } from "@/core/composables/useLanguages";
import { FALLBACK_LOCALE } from "@/core/constants";
import { registerLocaleLoader } from "@/core/locale-loaders";
import { Logger } from "@/core/utilities";
import type { ILanguage } from "@/core/types";
import type { I18n } from "@/i18n";
import type { LocaleMessageValue } from "vue-i18n";

export async function loadModuleLocale(i18n: I18n, moduleName: string): Promise<void> {
  const { currentLanguage } = useLanguages();

  // Re-load this module's messages on every runtime locale switch (e.g. the builder preview
  // applying the edited page's culture, VCST-5219), not just once at module init.
  registerLocaleLoader(`module:${moduleName}`, (i18nInstance: I18n, language: ILanguage) =>
    mergeModuleLocales(i18nInstance, moduleName, language),
  );

  await mergeModuleLocales(i18n, moduleName, currentLanguage.value);
}

async function mergeModuleLocales(i18n: I18n, moduleName: string, language?: ILanguage): Promise<void> {
  const { mergeLocalesMessages } = useLanguages();
  const locale = language?.twoLetterLanguageName || FALLBACK_LOCALE;

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

    mergeLocalesMessages(i18n, locale, moduleMessages);

    if (locale !== FALLBACK_LOCALE) {
      mergeLocalesMessages(i18n, FALLBACK_LOCALE, moduleFallbackMessages);
    }
  } catch (error) {
    Logger.error(`Error loading the ${moduleName} module locale: "${locale}"`, error);
  }
}
