import { useLocalStorage } from "@vueuse/core";
import { merge } from "lodash";
import { computed, nextTick, ref } from "vue";
import { useRouter } from "vue-router";
import { setLocale as setLocaleForYup } from "yup";
import { useUser } from "@/shared/account/composables/useUser";
import { updateRouteWithLocale } from "../utilities/localization";
import { useThemeContext } from "./useThemeContext";
import type { ILanguage } from "../types";
import type { I18n } from "@/i18n";
import type { LocaleMessage } from "@intlify/core-base";
import type { Composer, LocaleMessageValue } from "vue-i18n";
import type { Router } from "vue-router";

const currentLanguage = ref<ILanguage>();

const { themeContext } = useThemeContext();

const pinnedLocale = useLocalStorage<string | null>("pinnedLocale", null);

const defaultStoreLanguage = computed<ILanguage>(() => themeContext.value.defaultLanguage);
const defaultStoreLocale = computed(() => defaultStoreLanguage.value.twoLetterLanguageName);
const defaultStoreCulture = computed(() => defaultStoreLanguage.value.cultureName);

const supportedLanguages = computed(() => themeContext.value.availableLanguages);
const supportedLocales = computed(() => supportedLanguages.value.map((item) => item.twoLetterLanguageName));
const supportedCultures = computed(() => supportedLanguages.value.map((item) => item.cultureName));

const isDefaultLanguageInUse = computed(() => {
  return !!currentLanguage.value && currentLanguage.value?.cultureName === defaultStoreCulture.value;
});

function fetchLocaleMessages(locale: string): Promise<LocaleMessage> {
  const locales = import.meta.glob<boolean, string, LocaleMessage>("../../../locales/*.json");
  const path = `../../../locales/${locale}.json`;

  if (locales[path]) {
    return locales[path]();
  }

  return import("../../../locales/en.json");
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

    return defaultStoreLocale.value;
  }

  async function initLocale(i18n: I18n, locale: string, router?: Router) {
    currentLanguage.value = supportedLanguages.value.find((x) => x.twoLetterLanguageName === locale);
    await nextTick();

    if (isDefaultLanguageInUse.value) {
      void removeLocaleFromUrl(router);
    }

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

  async function removeLocaleFromUrl(router?: Router) {
    if (!router) {
      router = useRouter();
    }

    await router?.replace(updateRouteWithLocale(router?.currentRoute?.value, ""));
  }

  return {
    pinnedLocale,
    defaultLanguage: defaultStoreLanguage,
    defaultLocale: defaultStoreLocale,
    supportedLanguages,
    supportedLocales,
    currentLanguage: computed({
      get() {
        return currentLanguage.value || defaultStoreLanguage.value;
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
