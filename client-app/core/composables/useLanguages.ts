import { useLocalStorage } from "@vueuse/core";
import { merge } from "lodash";
import { computed, ref } from "vue";
import { setLocale as setLocaleForYup } from "yup";
import { tryShortLocale } from "@/core/utilities/localization";
import { useThemeContext } from "./useThemeContext";
import type { ILanguage } from "../types";
import type { I18n } from "@/i18n";
import type { LocaleMessage } from "@intlify/core-base";
import type { Composer, LocaleMessageValue } from "vue-i18n";

const { themeContext } = useThemeContext();

const pinnedLocale = useLocalStorage<string | null>("pinnedLocale", null);

const defaultLanguage = computed<ILanguage>(() => themeContext.value.defaultLanguage);
const defaultStoreCulture = computed<string>(() => defaultLanguage.value.cultureName);

const supportedLanguages = computed<ILanguage[]>(() => themeContext.value.availableLanguages);
const supportedLocalesWithShortAliases = computed(() =>
  supportedLanguages.value.reduce((acc, item) => {
    acc.push(item.cultureName);
    const maybeShortLocale = tryShortLocale(item.cultureName, supportedLanguages.value);
    if (maybeShortLocale !== item.cultureName) {
      acc.push(maybeShortLocale);
    }
    return acc;
  }, [] as string[]),
);

const URL_LOCALE_REGEX = computed(
  () => new RegExp(`^/(?<locale>${supportedLocalesWithShortAliases.value.join("|")})(/|$)`, "i"),
);

const currentLanguage = ref<ILanguage>();

function fetchLocaleMessages(locale: string): Promise<LocaleMessage> {
  const localesPathPrefix = "../../../locales";

  const locales = import.meta.glob<boolean, string, LocaleMessage>("../../../locales/*.json"); // can't use variables in import.meta.glob
  const path = `${localesPathPrefix}/${locale}.json`;
  const shortPath = `${localesPathPrefix}/${locale.slice(0, 2)}.json`;

  if (locales[path]) {
    return locales[path]();
  } else if (locale.length > 2 && locales[shortPath]) {
    return locales[shortPath](); // try get short locale as a fallback (e.g. en-US -> en)
  }

  return import(`${localesPathPrefix}/en.json`);
}

async function initLocale(i18n: I18n, locale: string): Promise<void> {
  currentLanguage.value = supportedLanguages.value.find((x) => x.cultureName === locale);

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
  return window.location.pathname.match(URL_LOCALE_REGEX.value)?.groups?.locale;
}

function removeLocaleFromUrl() {
  const fullPath = window.location.pathname + window.location.search + window.location.hash;

  const newUrl = getUrlWithoutLocale(fullPath);
  if (fullPath !== newUrl) {
    history.pushState(null, "", newUrl);
  }
}

function getUrlWithoutLocale(fullPath: string): string {
  const locale = fullPath.match(URL_LOCALE_REGEX.value)?.groups?.locale;

  if (locale) {
    return fullPath.replace(URL_LOCALE_REGEX.value, "/");
  }

  return fullPath;
}

function pinLocale(locale: string) {
  pinnedLocale.value = locale;
}

function unpinLocale() {
  pinnedLocale.value = null;
}

function mergeLocales(i18n: I18n, locale: string, messages: LocaleMessageValue) {
  const existingMessages = i18n.global.getLocaleMessage(locale);

  i18n.global.setLocaleMessage(locale, merge({}, existingMessages, messages));
}

function resolveLocale({
  urlLocale,
  contactLocale,
}: {
  urlLocale?: string;
  contactLocale?: string;
} = {}) {
  if (urlLocale && supportedLocalesWithShortAliases.value.includes(urlLocale)) {
    const urlCultureName = supportedLanguages.value.find(
      (x) => x.cultureName === urlLocale || x.twoLetterLanguageName === urlLocale,
    )?.cultureName;

    if (urlCultureName) {
      return urlCultureName;
    }
  }

  if (pinnedLocale.value && supportedLocalesWithShortAliases.value.includes(pinnedLocale.value)) {
    return pinnedLocale.value;
  }

  if (contactLocale && supportedLocalesWithShortAliases.value.includes(contactLocale)) {
    return contactLocale;
  }

  return defaultStoreCulture.value;
}

export function useLanguages() {
  return {
    pinnedLocale,
    defaultLanguage,
    supportedLanguages,
    currentLanguage: computed({
      get() {
        return currentLanguage.value || defaultLanguage.value;
      },

      set() {
        throw new Error("currentLanguage is read only.");
      },
    }),

    initLocale,
    fetchLocaleMessages,

    pinLocale,
    unpinLocale,
    removeLocaleFromUrl,
    mergeLocales,
    resolveLocale,
    getLocaleFromUrl,
  };
}
