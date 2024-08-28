import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";
import { setLocale as setLocaleForYup } from "yup";
import { useUser } from "@/shared/account/composables/useUser";
import { useThemeContext } from "./useThemeContext";
import type { ILanguage } from "../types";
import type { I18n } from "@/i18n";
import type { LocaleMessage } from "@intlify/core-base";
import type { Composer } from "vue-i18n";

const { themeContext } = useThemeContext();
const { user } = useUser();

const savedLocale = useLocalStorage<string>("locale", "");

const defaultLanguage = computed<ILanguage>(() => themeContext.value.defaultLanguage);
const defaultLocale = computed<string>(() => defaultLanguage.value.twoLetterLanguageName);
const supportedLanguages = computed<ILanguage[]>(() => themeContext.value.availableLanguages);
const supportedLocales = computed<string[]>(() => supportedLanguages.value.map((item) => item.twoLetterLanguageName));
const contactLocale = computed(() => user.value?.contact?.defaultLanguage?.split("-")[0]);

const currentLocale = computed<string>(() => {
  const localeInPath = location.pathname.split("/")[1];
  let locale: string = defaultLocale.value;

  if (supportedLocales.value.includes(localeInPath)) {
    locale = localeInPath;
  } else if (contactLocale.value && supportedLocales.value.includes(contactLocale.value)) {
    locale = contactLocale.value;
  } else if (supportedLocales.value.includes(savedLocale.value)) {
    locale = savedLocale.value;
  }

  return locale;
});

const currentLanguage = computed<ILanguage>(
  () => supportedLanguages.value.find((x) => x.twoLetterLanguageName === currentLocale.value) || defaultLanguage.value,
);

function fetchLocaleMessages(locale: string): Promise<LocaleMessage> {
  const locales = import.meta.glob<boolean, string, LocaleMessage>("../../../locales/*.json");
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

  (i18n.global as unknown as Composer).locale.value = locale;

  savedLocale.value = locale;

  setLocaleForYup({
    mixed: {
      required: i18n.global.t("common.messages.required_field"),
    },
    string: {
      email: i18n.global.t("common.messages.email_is_not_correct"),
      max: ({ max }) => i18n.global.t("common.messages.max_length", { max }),
    },
  });

  /**
   * NOTE:
   * If you need to specify the language setting for headers, such as the "fetch" API, set it here.
   * The following is an example for axios.
   *
   * axios.defaults.headers.common['Accept-Language'] = locale
   */

  document.documentElement.setAttribute("lang", locale);
}

function saveLocale(locale: string, needToReload: boolean = true) {
  const { pathname } = location;
  const splitPathname = pathname.split("/");
  const localeInPath = splitPathname[1];
  const indexOfRemainingPath = 2;
  const path = supportedLocales.value?.includes(localeInPath)
    ? `/${splitPathname.slice(indexOfRemainingPath).join("/")}`
    : pathname;

  savedLocale.value = locale;

  if (needToReload) {
    location.href = locale === defaultLocale.value ? path : `/${locale}${path}`;
  }
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
    saveLocale,
    fetchLocaleMessages,
  };
}
