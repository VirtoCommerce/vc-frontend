import { useLocalStorage } from "@vueuse/core";
import { merge } from "lodash";
import { computed, ref } from "vue";
import { setLocale as setLocaleForYup } from "yup";
import { useUser } from "@/shared/account/composables/useUser";
import { useThemeContext } from "./useThemeContext";
import type { ILanguage } from "../types";
import type { I18n } from "@/i18n";
import type { LocaleMessage } from "@intlify/core-base";
import type { Composer, LocaleMessageValue } from "vue-i18n";

const currentLanguage = ref<ILanguage>();

const { themeContext } = useThemeContext();

const pinnedLocale = useLocalStorage<string | null>("pinnedLocale", null);

const defaultLanguage = computed<ILanguage>(() => themeContext.value.defaultLanguage);
const defaultLocale = computed<string>(() => defaultLanguage.value.twoLetterLanguageName);
const defaultCulture = computed<string>(() => defaultLanguage.value.cultureName);

const supportedLanguages = computed<ILanguage[]>(() => themeContext.value.availableLanguages);
const supportedLocales = computed<string[]>(() => supportedLanguages.value.map((item) => item.twoLetterLanguageName));
const supportedCultures = computed<string[]>(() => supportedLanguages.value.map((item) => item.cultureName));

const isDefaultLanguageInUse = computed<boolean>(() => currentLanguage.value?.cultureName === defaultCulture.value);

function fetchLocaleMessages(locale: string): Promise<LocaleMessage> {
  const locales = import.meta.glob<boolean, string, LocaleMessage>("../../../locales/*.json");
  const path = `../../../locales/${locale}.json`;

  if (locales[path]) {
    return locales[path]();
  }

  return import("../../../locales/en.json");
}

async function initLocale(i18n: I18n, locale: string): Promise<void> {
  currentLanguage.value = supportedLanguages.value.find((x) => x.twoLetterLanguageName === locale);
  console.log("initLocale", locale);

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

function removeLocaleFromUrl() {
  // const fullPath = window.location.pathname + window.location.search + window.location.hash;
  // const newUrl = getUrlWithoutLocale(fullPath);
  // if (fullPath !== newUrl) {
  //   history.pushState(null, "", newUrl);
  // }
  // TODO: Implement
}

function pinLocale(locale: string) {
  pinnedLocale.value = locale;
}

function unpinLocale() {
  pinnedLocale.value = null;
}

function isLocaleSupported(locale: string): boolean {
  return supportedLocales.value.includes(locale);
}

function mergeLocales(i18n: I18n, locale: string, messages: LocaleMessageValue) {
  const existingMessages = i18n.global.getLocaleMessage(locale);

  i18n.global.setLocaleMessage(locale, merge({}, existingMessages, messages));
}

export function useLanguages() {
  const { twoLetterContactLocale } = useUser();

  function resolveLocale(localeFromRoute: string | undefined) {
    if (localeFromRoute && isLocaleSupported(localeFromRoute)) {
      return localeFromRoute;
    }

    if (pinnedLocale.value && isLocaleSupported(pinnedLocale.value)) {
      return pinnedLocale.value;
    }

    if (twoLetterContactLocale.value && isLocaleSupported(twoLetterContactLocale.value)) {
      return twoLetterContactLocale.value;
    }

    return defaultLocale.value;
  }

  return {
    pinnedLocale,
    defaultLanguage,
    defaultLocale,
    supportedLanguages,
    supportedLocales,
    currentLanguage: computed({
      get() {
        return currentLanguage.value || defaultLanguage.value;
      },

      set() {
        throw new Error("currentLanguage is read only.");
      },
    }),
    isDefaultLanguageInUse,

    initLocale,
    fetchLocaleMessages,

    pinLocale,
    unpinLocale,
    removeLocaleFromUrl,
    resolveLocale,
    mergeLocales,
  };
}
