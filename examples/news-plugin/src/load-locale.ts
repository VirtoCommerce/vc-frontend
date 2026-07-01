import { useLanguages, FALLBACK_LOCALE, globals } from "@vc-frontend/core";

/**
 * Plugin-local locale loader.
 *
 * The host's `loadModuleLocale` (client-app/modules/utils.ts) resolves locale JSON
 * via a dynamic import glob rooted at the HOST's `modules/` directory, so a
 * federated plugin cannot reuse it — its locales live in its own bundle/origin.
 * Instead we glob the plugin's own `locales/` and merge into the host's shared i18n
 * instance (`globals.i18n`), using the host-provided `useLanguages`.
 */
const localeImporters = import.meta.glob<{ default: Record<string, unknown> }>("./locales/*.json");

async function loadMessages(locale: string): Promise<Record<string, unknown>> {
  const importer = localeImporters[`./locales/${locale}.json`];
  if (!importer) {
    return {};
  }
  try {
    return (await importer()).default;
  } catch {
    return {};
  }
}

export async function loadNewsLocale(): Promise<void> {
  const { i18n } = globals;
  const { currentLanguage, mergeLocalesMessages } = useLanguages();
  const locale = currentLanguage.value?.twoLetterLanguageName || FALLBACK_LOCALE;

  const [messages, fallbackMessages] = await Promise.all([
    loadMessages(locale),
    locale !== FALLBACK_LOCALE ? loadMessages(FALLBACK_LOCALE) : Promise.resolve({}),
  ]);

  mergeLocalesMessages(i18n, locale, messages);
  if (locale !== FALLBACK_LOCALE) {
    mergeLocalesMessages(i18n, FALLBACK_LOCALE, fallbackMessages);
  }
}
