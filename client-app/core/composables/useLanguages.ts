import { useLocalStorage } from "@vueuse/core";
import { merge } from "lodash";
import { computed, ref } from "vue";
import { setLocale as setLocaleForYup } from "yup";
import { Logger } from "@/core/utilities";
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

const currentLanguage = ref<ILanguage>();

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

function removeLocaleFromUrl() {
  const fullPath = window.location.pathname + window.location.search + window.location.hash;

  const newUrl = getUrlWithoutLocale(fullPath);
  if (fullPath !== newUrl) {
    history.pushState(null, "", newUrl);
  }
}

function getUrlWithoutLocale(fullPath: string): string {
  const locale = fullPath.match(URL_LOCALE_REGEX)?.[1];

  if (locale && isLocaleSupported(locale)) {
    return fullPath.replace(URL_LOCALE_REGEX, "/");
  }

  return fullPath;
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

async function loadModuleLocale(i18n: I18n, moduleName: string): Promise<void> {
  const locale = currentLanguage.value?.twoLetterLanguageName;
  const FALLBACK_LOCALE = "en";
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [moduleMessagesFallback, moduleMessages] = await Promise.all([
      locale !== FALLBACK_LOCALE
        ? import(`../../modules/${moduleName}/locales/${FALLBACK_LOCALE}.json`).catch((error) => {
            Logger.error(`Fallback locale: ${FALLBACK_LOCALE} for the module ${moduleName} not found`, error);

            return {};
          })
        : Promise.resolve({}),
      import(`../../modules/${moduleName}/locales/${locale}.json`).catch((error) => {
        Logger.error(`Locale: ${locale} for the module ${moduleName} not found`, error);

        return {};
      }),
    ]);

    const existingMessages = i18n.global.getLocaleMessage(locale as string);

    i18n.global.setLocaleMessage(locale as string, {
      ...existingMessages,
      ...merge({}, moduleMessagesFallback, moduleMessages),
    });

    Logger.debug(`The "${moduleName}" module locale: "${locale}" was loaded successfully.`);
  } catch (error) {
    Logger.error(`Error loading the ${moduleName} module locale: "${locale}"`);
  }
}

export function useLanguages() {
  return {
    pinedLocale,
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
    initLocale,
    fetchLocaleMessages,

    pinLocale,
    unpinLocale,
    removeLocaleFromUrl,
    detectLocale,
    getLocaleFromUrl,

    loadModuleLocale,
  };
}
