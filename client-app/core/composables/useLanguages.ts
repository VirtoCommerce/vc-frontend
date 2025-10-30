import { useLocalStorage, useSessionStorage } from "@vueuse/core";
import { merge } from "lodash";
import { computed, ref } from "vue";
import { setLocale as setLocaleForYup } from "yup";
import { useUser } from "@/shared/account/composables/useUser";
import { useThemeContext } from "./useThemeContext";
import type { ILanguage } from "../types";
import type { I18n } from "@/i18n";
import type { LocaleMessage } from "@intlify/core-base";
import type { Composer, LocaleMessageValue } from "vue-i18n";

const { themeContext } = useThemeContext();

const pinnedLocale = useLocalStorage<string | null>("pinnedLocale", null);
const previousCultureSlug = useSessionStorage<{ cultureName: string; slug: string }>("previousCultureSlug", {
  cultureName: "",
  slug: "",
});

const defaultStoreLanguage = computed<ILanguage>(() => themeContext.value.defaultLanguage);
const defaultStoreCulture = computed<string>(() => defaultStoreLanguage.value.cultureName);

const supportedLanguages = computed<ILanguage[]>(() => themeContext.value.availableLanguages);
const supportedCultureNames = computed(() => supportedLanguages.value.map((language) => language.cultureName));
const supportedLocalesWithShortAliases = computed(() =>
  supportedLanguages.value.flatMap((language) => {
    const maybeShortLocale = tryShortLocale(language.cultureName);
    return maybeShortLocale === language.cultureName
      ? [language.cultureName]
      : [language.cultureName, maybeShortLocale];
  }),
);

const supportedLocalesRegex = computed(
  () => new RegExp(`^/(?<locale>${supportedLocalesWithShortAliases.value.join("|")})(/|$)`, "i"),
);

const possibleLocaleRegex = computed(() => /^\/?([a-z]{2}(?:-[A-Z]{2})?)(\/|$)/i);

const currentLanguage = ref<ILanguage>();
const currentMaybeShortLocale = computed(() => {
  return tryShortLocale(currentLanguage.value?.cultureName ?? "");
});

function tryShortLocale(localeOrCultureName: string) {
  const twoLetterLanguageName = localeOrCultureName.slice(0, 2);

  return supportedLanguages.value.filter((language) => language.twoLetterLanguageName === twoLetterLanguageName)
    .length === 1
    ? twoLetterLanguageName
    : localeOrCultureName;
}

function fetchLocaleMessages(locale: string): Promise<LocaleMessage> {
  const localesPathPrefix = "../../../locales";

  const locales = import.meta.glob<boolean, string, LocaleMessage>("../../../locales/*.json"); // can't use variables in import
  const path = `${localesPathPrefix}/${locale}.json`;
  const shortPath = `${localesPathPrefix}/${locale.slice(0, 2)}.json`;

  if (locales[path]) {
    return locales[path]();
  } else if (locale.length > 2 && locales[shortPath]) {
    return locales[shortPath](); // try get short locale as a fallback (e.g. en-US.json -> en.json)
  }

  return import("../../../locales/en.json"); // can't use variables in import
}

async function initLocale(i18n: I18n, cultureName: string): Promise<void> {
  currentLanguage.value = supportedLanguages.value.find((x) => x.cultureName === cultureName);

  let messages = i18n.global.getLocaleMessage(cultureName);

  if (!Object.keys(messages).length) {
    messages = await fetchLocaleMessages(cultureName);
    i18n.global.setLocaleMessage(cultureName, messages);
  }

  (i18n.global as unknown as Composer).locale.value = cultureName;

  setLocaleForYup({
    mixed: {
      required: i18n.global.t("common.messages.required_field"),
    },
    string: {
      email: i18n.global.t("common.messages.email_is_not_correct"),
      max: ({ max }) => i18n.global.t("common.messages.max_length", { max }),
    },
  });

  const localeFromUrl = getLocaleFromUrl();
  const isDefault = defaultStoreLanguage.value.cultureName === cultureName;

  if ((localeFromUrl && currentMaybeShortLocale.value !== localeFromUrl) || isDefault) {
    // remove a full locale from the url beforehand in order to avoid case like /fr-FR -> /fr/-FR (when language has short alias)
    // remove the default locale e.g. en-US from the url - /en-US/cart -> /cart
    history.pushState(null, "", location.href.replace(new RegExp(`/${localeFromUrl}`), ""));
  }

  document.documentElement.setAttribute("lang", cultureName);
}

function getLocaleFromUrl(): string | undefined {
  return supportedLocalesRegex.value.exec(location.pathname)?.groups?.locale;
}

function getPossibleLocaleFromUrl(fullPath?: string): string | undefined {
  const path = fullPath ?? location.pathname;
  const match = possibleLocaleRegex.value.exec(path);
  return match ? match[1] : undefined;
}

function removeLocaleFromUrl() {
  const fullPath = location.pathname + location.search + location.hash;

  const newUrl = getUrlWithoutLocale(fullPath);
  if (fullPath !== newUrl) {
    history.pushState(null, "", newUrl);
  }
}

function getUrlWithoutLocale(fullPath: string): string {
  const locale = supportedLocalesRegex.value.exec(fullPath)?.groups?.locale;

  if (locale) {
    return fullPath.replace(supportedLocalesRegex.value, "/");
  }

  return fullPath;
}

function getUrlWithoutPossibleLocale(fullPath: string): string {
  const path = fullPath;
  const match = possibleLocaleRegex.value.exec(path);
  if (match) {
    const idxToSlice = match[0].length;
    let result = path.slice(idxToSlice);
    if (!result.startsWith("/")) result = "/" + result;
    return result === "/" ? result : result.replaceAll(/\/+/g, "/");
  }
  return fullPath;
}

function pinLocale(locale: string) {
  pinnedLocale.value = locale;
}

function unpinLocale() {
  pinnedLocale.value = null;
}

function mergeLocalesMessages(i18n: I18n, locale: string, messages: LocaleMessageValue) {
  const existingMessages = i18n.global.getLocaleMessage(locale);

  i18n.global.setLocaleMessage(locale, merge({}, existingMessages, messages));
}

export function useLanguages() {
  const { contactCultureName } = useUser();

  function resolveLocale() {
    const urlLocale = getLocaleFromUrl();

    const urlCultureName = supportedLanguages.value.find(
      (x) => x.cultureName === urlLocale || x.twoLetterLanguageName === urlLocale,
    )?.cultureName;

    if (urlCultureName) {
      return urlCultureName;
    }

    if (pinnedLocale.value && supportedCultureNames.value.includes(pinnedLocale.value)) {
      return pinnedLocale.value;
    }

    if (contactCultureName.value && supportedCultureNames.value.includes(contactCultureName.value)) {
      return contactCultureName.value;
    }

    return defaultStoreCulture.value;
  }

  // Only try resolving possible locale by Url or pinnedLocale since it's all we have before sending the combined pageContext request
  function resolvePossibleLocale(fullPath: string) {
    const locale = getPossibleLocaleFromUrl(fullPath);
    if (locale) {
      return locale;
    }

    if (pinnedLocale.value) {
      return pinnedLocale.value;
    }

    return undefined;
  }

  function updateLocalizedUrl(permalink?: string) {
    if (!permalink) {
      return;
    }

    const localeFromUrl = getLocaleFromUrl();
    const normalizedPermalink = permalink.startsWith("/") ? permalink : `/${permalink}`;
    const permalinkWithLocale = localeFromUrl ? `/${localeFromUrl}${normalizedPermalink}` : normalizedPermalink;

    history.pushState(history.state, "", `${permalinkWithLocale}${location.search}${location.hash}`);
  }

  return {
    pinnedLocale,
    defaultStoreLanguage,
    defaultStoreCulture,
    supportedLanguages,
    previousCultureSlug,
    currentMaybeShortLocale,
    currentLanguage: computed({
      get() {
        return currentLanguage.value || defaultStoreLanguage.value;
      },

      set() {
        throw new Error("currentLanguage is read only.");
      },
    }),

    initLocale,
    resolveLocale,
    fetchLocaleMessages,
    mergeLocalesMessages,

    pinLocale,
    unpinLocale,

    getLocaleFromUrl,
    getPossibleLocaleFromUrl,
    getUrlWithoutLocale,
    getUrlWithoutPossibleLocale,
    removeLocaleFromUrl,
    updateLocalizedUrl,
    resolvePossibleLocale,
  };
}
