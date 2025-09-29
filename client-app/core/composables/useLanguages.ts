import { useLocalStorage } from "@vueuse/core";
import { merge } from "lodash";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { setLocale as setLocaleForYup } from "yup";
import { ROUTES } from "@/router/routes/constants";
import { useUser } from "@/shared/account/composables/useUser";
import { updateRouteWithLocale, tryShortLocale } from "../utilities/localization";
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
  } else if (locale.length > 2 && locales[path.slice(0, 2)]) {
    return locales[path.slice(0, 2)](); // try get short locale as a fallback (e.g. en-US -> en)
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

  async function resolveLocale(localeOrCultureNameFromRoute: string | undefined, routerInstance?: Router) {
    if (localeOrCultureNameFromRoute) {
      if (isCultureSupported(localeOrCultureNameFromRoute) || isLocaleSupported(localeOrCultureNameFromRoute)) {
        return localeOrCultureNameFromRoute;
      }
      console.log("redirecting to 404", routerInstance);
      await routerInstance?.replace({ name: ROUTES.NOT_FOUND.NAME });
      return defaultStoreCulture.value;
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
    currentLanguage.value = supportedLanguages.value.find(
      (x) => x.cultureName === localeOrCultureName || x.twoLetterLanguageName === localeOrCultureName,
    );

    if (!currentLanguage.value) {
      throw new Error(`Language ${localeOrCultureName} not found`);
    }

    const maybeShortLocale = tryShortLocale(localeOrCultureName, supportedLanguages.value);

    if (!isDefaultLanguageInUse.value) {
      void addLocaleToUrl(maybeShortLocale, routerInstance);
    } else {
      void removeLocaleFromUrl(routerInstance);
    }

    let messages = i18n.global.getLocaleMessage(maybeShortLocale);

    if (!Object.keys(messages).length) {
      messages = await fetchLocaleMessages(maybeShortLocale);
      i18n.global.setLocaleMessage(maybeShortLocale, messages);
    }

    (i18n.global as unknown as Composer).locale.value = maybeShortLocale;

    setLocaleForYup({
      mixed: {
        required: i18n.global.t("common.messages.required_field"),
      },
      string: {
        email: i18n.global.t("common.messages.email_is_not_correct"),
        max: ({ max }) => i18n.global.t("common.messages.max_length", { max }),
      },
    });

    document.documentElement.setAttribute("lang", maybeShortLocale);
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
