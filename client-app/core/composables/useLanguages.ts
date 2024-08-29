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

const pinedLocale = useLocalStorage<string | null>("pinedLocale", null);

const defaultLanguage = computed<ILanguage>(() => themeContext.value.defaultLanguage);
const defaultLocale = computed<string>(() => defaultLanguage.value.twoLetterLanguageName);
const supportedLanguages = computed<ILanguage[]>(() => themeContext.value.availableLanguages);
const supportedLocales = computed<string[]>(() => supportedLanguages.value.map((item) => item.twoLetterLanguageName));
const contactLocale = computed(() => user.value?.contact?.defaultLanguage?.split("-")[0]);

const currentLocale = computed<string>(() => {
  if (pinedLocale.value && isLocaleSupported(pinedLocale.value)) {
    return pinedLocale.value;
  }

  if (contactLocale.value && isLocaleSupported(contactLocale.value)) {
    return contactLocale.value;
  }

  const localeInPath = location.pathname.split("/")[1];
  if (localeInPath && isLocaleSupported(localeInPath)) {
    return localeInPath;
  }

  return defaultLocale.value;
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

function getUrlWithoutLocale(): string {
  const fullPath = window.location.pathname + window.location.search + window.location.hash;

  const localeRegex = /^\/([a-z]{2})(\/|$)/;
  const locale = fullPath.match(localeRegex)?.[1];

  if (locale && supportedLocales.value.includes(locale)) {
    return fullPath.replace(localeRegex, "/$2");
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

export function useLanguages() {
  return {
    pinedLocale,
    defaultLanguage,
    defaultLocale,
    supportedLanguages,
    supportedLocales,
    currentLocale,
    currentLanguage,
    initLocale,
    fetchLocaleMessages,

    pinLocale,
    unpinLocale,
    addOrRemoveLocaleInUrl,
    removeLocaleFromUrl,
  };
}
