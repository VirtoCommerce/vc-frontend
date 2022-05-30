import { computed } from "vue";
import { Composer, VueI18n } from "vue-i18n";
import { useThemeContext } from "@core/composables/index";
import { useLocalStorage } from "@vueuse/core";
import { Language } from "@core/types";
import { I18n } from "@/i18n";

const { themeContext } = useThemeContext();

const savedLocale = useLocalStorage<string>("locale", "");

const defaultLanguage = computed<Language | undefined>(() => themeContext.value?.defaultLanguage);
const defaultLocale = computed<string | undefined>(() => defaultLanguage.value?.twoLetterLanguageName);
const supportedLanguages = computed<Language[]>(() => themeContext.value?.availLanguages || []);
const supportedLocales = computed<string[]>(() => supportedLanguages.value.map((item) => item.twoLetterLanguageName));

const currentLocale = computed<string | undefined>(() => {
  const localeInPath = location.pathname.split("/")[1];
  let locale = defaultLocale.value;

  if (supportedLocales.value.includes(localeInPath)) {
    locale = localeInPath;
  } else if (supportedLocales.value.includes(savedLocale.value)) {
    locale = savedLocale.value;
  }

  return locale;
});

const currentLanguage = computed<Language | undefined>(() =>
  supportedLanguages.value.find((x) => x.twoLetterLanguageName === currentLocale.value)
);

function fetchLocaleMessages(locale: string) {
  /**
   * FIXME: Don't use import
   * Fetch localization files (json) from Storefront to be able to edit localization files in Admin panel
   */
  return import(`../../../locales/${locale}.json`);
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

export default function useLanguages() {
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
