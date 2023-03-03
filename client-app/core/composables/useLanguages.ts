import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";
import type { Composer, VueI18n } from "vue-i18n";
import type { I18n } from "@/i18n";
import type { ILanguage } from "../types";
import { useThemeContext } from "./useThemeContext";

const { themeContext } = useThemeContext();

const savedLocale = useLocalStorage<string>("locale", "");

const defaultLanguage = computed<ILanguage>(() => themeContext.value.defaultLanguage);
const defaultLocale = computed<string>(() => defaultLanguage.value.twoLetterLanguageName);
const supportedLanguages = computed<ILanguage[]>(() => themeContext.value.availLanguages);
const supportedLocales = computed<string[]>(() => supportedLanguages.value.map((item) => item.twoLetterLanguageName));

const currentLocale = computed<string>(() => {
  const localeInPath = location.pathname.split("/")[1];
  let locale: string = defaultLocale.value;

  if (supportedLocales.value.includes(localeInPath)) {
    locale = localeInPath;
  } else if (supportedLocales.value.includes(savedLocale.value)) {
    locale = savedLocale.value;
  }

  return locale;
});

const currentLanguage = computed<ILanguage>(
  () => supportedLanguages.value.find((x) => x.twoLetterLanguageName === currentLocale.value) || defaultLanguage.value
);

function fetchLocaleMessages(locale: string): Promise<any> {
  /**
   * FIXME: Don't use import
   * Fetch localization files (json) from Storefront to be able to edit localization files in Admin panel
   */
  const locales = import.meta.glob("../../../locales/*.json");
  const path = `../../../locales/${locale}.json`;

  if (locales[path]) {
    return locales[path]();
  }

  return import("../../../locales/en.json");
}

async function setLocale(i18n: I18n, locale: string): Promise<void> {
  let messages = i18n.global.getLocaleMessage(locale);

  if (!Object.keys(messages).length) {
    messages = await fetchLocaleMessages(locale);
    i18n.global.setLocaleMessage(locale, messages);
  }

  if (i18n.mode === "legacy") {
    (i18n.global as unknown as VueI18n).locale = locale;
  } else {
    (i18n.global as unknown as Composer).locale.value = locale;
  }

  savedLocale.value = locale;

  /**
   * NOTE:
   * If you need to specify the language setting for headers, such as the "fetch" API, set it here.
   * The following is an example for axios.
   *
   * axios.defaults.headers.common['Accept-Language'] = locale
   */

  document.documentElement.setAttribute("lang", locale);
}

function saveLocaleAndReload(locale: string) {
  const { pathname } = location;
  const splitPathname = pathname.split("/");
  const localeInPath = splitPathname[1];
  const indexOfRemainingPath = 2;
  const path = supportedLocales.value?.includes(localeInPath)
    ? `/${splitPathname.slice(indexOfRemainingPath).join("/")}`
    : pathname;

  savedLocale.value = locale;
  location.href = locale === defaultLocale.value ? path : `/${locale}${path}`;
}

export function useLanguages() {
  return {
    savedLocale,
    defaultLanguage,
    defaultLocale,
    supportedLanguages,
    supportedLocales,
    currentLocale,
    currentLanguage,
    setLocale,
    saveLocaleAndReload,
  };
}
