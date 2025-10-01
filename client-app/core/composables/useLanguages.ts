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

const { themeContext } = useThemeContext();

const pinnedLocale = useLocalStorage<string | null>("pinnedLocale", null);

const defaultLanguage = computed<ILanguage>(() => themeContext.value.defaultLanguage);
const defaultStoreCulture = computed<string>(() => defaultLanguage.value.cultureName);

const supportedLanguages = computed<ILanguage[]>(() => themeContext.value.availableLanguages);
const supportedCultureNames = computed(() => supportedLanguages.value.map((language) => language.cultureName));
const supportedLocalesWithShortAliases = computed(() =>
  supportedLanguages.value.flatMap((language) => {
    const shortLocale = tryShortLocale(language.cultureName);
    return shortLocale !== language.cultureName ? [language.cultureName, shortLocale] : [language.cultureName];
  }),
);

const URL_LOCALE_REGEX = computed(
  () => new RegExp(`^/(?<locale>${supportedLocalesWithShortAliases.value.join("|")})(/|$)`, "i"),
);

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

  const locales = import.meta.glob<boolean, string, LocaleMessage>("../../../locales/*.json"); // can't use variables in import.meta.glob
  const path = `${localesPathPrefix}/${locale}.json`;
  const shortPath = `${localesPathPrefix}/${locale.slice(0, 2)}.json`;

  if (locales[path]) {
    return locales[path]();
  } else if (locale.length > 2 && locales[shortPath]) {
    return locales[shortPath](); // try get short locale as a fallback (e.g. en-US.json -> en.json)
  }

  return import(`${localesPathPrefix}/en.json`);
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
  const maybeShortLocale = tryShortLocale(cultureName);
  const isDefault = defaultLanguage.value.cultureName === cultureName;

  if ((localeFromUrl && maybeShortLocale !== localeFromUrl) || isDefault) {
    // remove a full locale from the url beforehand in order to avoid case like /fr-FR -> /fr/-FR (when language has short alias)
    // remove the default locale e.g. en-US from the url - /en-US/cart -> /cart
    window.history.pushState(null, "", location.href.replace(new RegExp(`/${localeFromUrl}`), ""));
  }

  document.documentElement.setAttribute("lang", cultureName);
}

function getLocaleFromUrl(): string | undefined {
  return URL_LOCALE_REGEX.value.exec(window.location.pathname)?.groups?.locale;
}

function removeLocaleFromUrl() {
  const fullPath = window.location.pathname + window.location.search + window.location.hash;

  const newUrl = getUrlWithoutLocale(fullPath);
  if (fullPath !== newUrl) {
    history.pushState(null, "", newUrl);
  }
}

function getUrlWithoutLocale(fullPath: string): string {
  const locale = URL_LOCALE_REGEX.value.exec(fullPath)?.groups?.locale;

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

  function updateLocalizedUrl(permalink?: string) {
    if (!permalink) {
      return;
    }

    const localeFromUrl = getLocaleFromUrl();
    const normalizedPermalink = permalink.startsWith("/") ? permalink : `/${permalink}`;
    const permalinkWithLocale = localeFromUrl ? `/${localeFromUrl}${normalizedPermalink}` : normalizedPermalink;

    console.log("permalink", permalink);
    console.log("localeFromUrl", localeFromUrl);
    console.log("normalizedPermalink", normalizedPermalink);
    console.log("permalinkWithLocale", permalinkWithLocale);

    window.history.pushState(window.history.state, "", `${permalinkWithLocale}${location.search}${location.hash}`);
  }

  return {
    pinnedLocale,
    defaultLanguage,
    supportedLanguages,
    currentMaybeShortLocale,
    currentLanguage: computed({
      get() {
        return currentLanguage.value || defaultLanguage.value;
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
    removeLocaleFromUrl,
    updateLocalizedUrl,
  };
}
