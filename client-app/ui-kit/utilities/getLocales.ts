import { Logger } from "@/core/utilities";
import type { LocaleMessageValue } from "vue-i18n";

export async function getLocales(
  fallbackLocale: string,
  locale?: string,
): Promise<{ messages: LocaleMessageValue; fallbackMessages: LocaleMessageValue }> {
  try {
    const [fallbackMessages, messages] = await Promise.all<LocaleMessageValue[]>([
      locale !== fallbackLocale
        ? import(`../locales/${fallbackLocale}.json`).catch((error) => {
            Logger.error(`Fallback locale: ${fallbackLocale} for the UI Kit not found`, error);

            return {};
          })
        : Promise.resolve({}),
      import(`../locales/${locale}.json`).catch((error) => {
        Logger.error(`Locale: ${locale} for the UI Kit not found`, error);

        return {};
      }),
    ]);
    Logger.debug(`The UI Kit locale: "${locale}" was loaded successfully.`);

    return {
      messages,
      fallbackMessages,
    };
  } catch (e) {
    Logger.error(`Error loading the UI Kit locale: "${locale}"`);
    return {
      messages: {},
      fallbackMessages: {},
    };
  }
}
