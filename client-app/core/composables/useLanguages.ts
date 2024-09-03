import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";
import { setLocale as setLocaleForYup } from "yup";
import { useThemeContext } from "./useThemeContext";
import type { ILanguage } from "../types";
import type { I18n } from "@/i18n";
import type { LocaleMessage } from "@intlify/core-base";
import type { Composer } from "vue-i18n";

const { themeContext } = useThemeContext();

const pinedLocale = useLocalStorage<string | null>("pinedLocale", null);

const defaultLanguage = computed<ILanguage>(() => themeContext.value.defaultLanguage);
const defaultLocale = computed<string>(() => defaultLanguage.value.twoLetterLanguageName);
const supportedLanguages = computed<ILanguage[]>(() => themeContext.value.availableLanguages);
const supportedLocales = computed<string[]>(() => supportedLanguages.value.map((item) => item.twoLetterLanguageName));
const URL_LOCALE_REGEX = /^\/([a-z]{2})(\/|$)/;

let currentLocale: string;

const currentLanguage = computed<ILanguage>(
  () => supportedLanguages.value.find((x) => x.twoLetterLanguageName === currentLocale) || defaultLanguage.value,
);

function fetchLocaleMessages(locale: string): Promise<LocaleMessage> {
  const locales = import.meta.glob<boolean, string, LocaleMessage>("../../../locales/*.json");
  const path = `../../../locales/${locale}.json`;

  if (locales[path]) {
    return locales[path]();
  }

  return import("../../../locales/en.json");
}

async function initLocale(i18n: I18n, locale: string): Promise<void> {
  let messages = i18n.global.getLocaleMessage(locale);

  if (!Object.keys(messages).length) {
    messages = await fetchLocaleMessages(locale);
    i18n.global.setLocaleMessage(locale, messages);
  }

  (i18n.global as unknown as Composer).locale.value = locale;

  setLocaleForYup({
    mixed: {
      required: i18n.global.t("common.messages.required_field"),
    },
    string: {
      email: i18n.global.t("common.messages.email_is_not_correct"),
      max: ({ max }) => i18n.global.t("common.messages.max_length", { max }),
    },
  });

  document.documentElement.setAttribute("lang", locale);
}

function getLocaleFromUrl(): string | undefined {
  return window.location.pathname.match(URL_LOCALE_REGEX)?.[1];
}

function getUrlWithoutLocale(): string {
  const fullPath = window.location.pathname + window.location.search + window.location.hash;

  const locale = fullPath.match(URL_LOCALE_REGEX)?.[1];

  if (locale && supportedLocales.value.includes(locale)) {
    return fullPath.replace(URL_LOCALE_REGEX, "/$2");
  }

  return fullPath;
}

function removeLocaleFromUrl(reloadPage = true) {
  const newUrl = getUrlWithoutLocale();

  if (reloadPage) {
    location.href = newUrl;
  } else {
    history.pushState(null, "", newUrl);
  }
}

function addOrRemoveLocaleInUrl(locale: string, reloadPage = true) {
  currentLocale = locale;

  const path = getUrlWithoutLocale();
  const resultPath = locale === defaultLocale.value ? path : `/${locale}${path}`;

  if (reloadPage) {
    location.href = resultPath;
  } else {
    history.pushState(null, "", resultPath);
  }
}

function pinLocale(locale: string) {
  pinedLocale.value = locale;
}

function unpinLocale() {
  pinedLocale.value = null;
}

function isLocaleSupported(locale: string): boolean {
  return supportedLocales.value.includes(locale);
}

function detectLocale(locales: unknown[]): string {
  const stringLocales = locales
    .filter((locale): locale is string => typeof locale === "string" && locale.length === 2)
    .filter(isLocaleSupported);

  return stringLocales[0] || defaultLocale.value;
}

export function useLanguages() {
  return {
    pinedLocale,
    defaultLanguage,
    defaultLocale,
    supportedLanguages,
    supportedLocales,
    currentLanguage,
    initLocale,
    fetchLocaleMessages,

    pinLocale,
    unpinLocale,
    addOrRemoveLocaleInUrl,
    removeLocaleFromUrl,
    detectLocale,
    getLocaleFromUrl,
  };
}
