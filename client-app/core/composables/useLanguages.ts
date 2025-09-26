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

// const languagesMapping = computed(() => {
//   return supportedLanguages.value.reduce((acc, item) => {
//     acc[item.cul] = item.cultureName;
//     return acc;
//   }, {} as Record<string, string>);
// });

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

function isCultureSupported(cultureName: string): boolean {
  return supportedCultures.value.includes(cultureName);
}

function mergeLocales(i18n: I18n, locale: string, messages: LocaleMessageValue) {
  const existingMessages = i18n.global.getLocaleMessage(locale);

  i18n.global.setLocaleMessage(locale, merge({}, existingMessages, messages));
}

export function useLanguages() {
  const { contactCultureName } = useUser();
  const router = useRouter();

  function resolveLocale(localeOrCultureNameFromRoute: string | undefined) {
    if (
      localeOrCultureNameFromRoute &&
      (isCultureSupported(localeOrCultureNameFromRoute) || isLocaleSupported(localeOrCultureNameFromRoute))
    ) {
      return localeOrCultureNameFromRoute;
    }

    if (pinnedLocale.value && isCultureSupported(pinnedLocale.value)) {
      return pinnedLocale.value;
    }

    if (contactCultureName.value && isCultureSupported(contactCultureName.value)) {
      return contactCultureName.value;
    }

    return defaultStoreCulture.value;
  }

  async function initLocale(i18n: I18n, localeOrCultureName: string, routerInstance?: Router) {
    console.log("init localeOrCultureName", localeOrCultureName);
    currentLanguage.value = supportedLanguages.value.find(
      (x) => x.cultureName === localeOrCultureName || x.twoLetterLanguageName === localeOrCultureName,
    );

    if (!currentLanguage.value) {
      throw new Error(`Language ${localeOrCultureName} not found`);
    }

    if (!isDefaultLanguageInUse.value) {
      void addLocaleToUrl(currentLanguage.value?.cultureName, routerInstance);
    } else {
      void removeLocaleFromUrl(routerInstance);
    }

    let messages = i18n.global.getLocaleMessage(currentLanguage.value?.twoLetterLanguageName);

    if (!Object.keys(messages).length) {
      messages = await fetchLocaleMessages(currentLanguage.value?.twoLetterLanguageName);
      i18n.global.setLocaleMessage(currentLanguage.value?.twoLetterLanguageName, messages);
    }

    (i18n.global as unknown as Composer).locale.value = currentLanguage.value?.twoLetterLanguageName;

    setLocaleForYup({
      mixed: {
        required: i18n.global.t("common.messages.required_field"),
      },
      string: {
        email: i18n.global.t("common.messages.email_is_not_correct"),
        max: ({ max }) => i18n.global.t("common.messages.max_length", { max }),
      },
    });

    document.documentElement.setAttribute("lang", currentLanguage.value?.twoLetterLanguageName);
  }

  async function removeLocaleFromUrl(routerInstance?: Router) {
    const currentRouter = routerInstance ?? router;
    await currentRouter?.replace(updateRouteWithLocale(currentRouter?.currentRoute?.value, ""));
  }

  async function addLocaleToUrl(locale: string, routerInstance?: Router) {
    const currentRouter = routerInstance ?? router;
    await currentRouter?.replace(updateRouteWithLocale(currentRouter?.currentRoute?.value, locale));
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
