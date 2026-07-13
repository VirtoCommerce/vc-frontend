import { useLocalStorage, useSessionStorage } from "@vueuse/core";
import { merge } from "lodash-es";
import { computed, ref } from "vue";
import { setLocale as setLocaleForYup } from "yup";
import { LOCALE_ID_REGEX } from "@/core/constants/locale";
import { QueryParamName } from "@/core/enums";
import { runLocaleLoaders } from "@/core/locale-loaders";
import { getDefaultNumberFormats } from "@/i18n";
import { useUser } from "@/shared/account/composables/useUser";
import { getCatalogBasePath } from "@/shared/catalog/composables/useCatalogBasePath";
import { useCurrency } from "./useCurrency";
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
// Culture this tab's facets were built under; session-scoped like previousCultureSlug above, so tabs
// on different locales don't wipe each other's valid facets via a shared localStorage key.
const facetsCultureName = useSessionStorage<string>("facetsCultureName", "");

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

const possibleLocaleRegex = computed(() => /^\/?(?<locale>[a-z]{2}(?:-[A-Z]{2})?)(\/|$)/i);

const currentLanguage = ref<ILanguage>();
const currentMaybeShortLocale = computed(() => {
  return tryShortLocale(currentLanguage.value?.cultureName ?? "");
});

function tryShortLocale(localeOrCultureName: string) {
  const twoLetterLanguageName = localeOrCultureName?.slice(0, 2) ?? "";

  return supportedLanguages.value.filter((language) => language.twoLetterLanguageName === twoLetterLanguageName)
    .length === 1
    ? twoLetterLanguageName
    : localeOrCultureName;
}

function fetchLocaleMessages(locale: string): Promise<LocaleMessage> {
  const localesPathPrefix = "../../../locales";

  const locales = import.meta.glob<boolean, string, LocaleMessage>("../../../locales/*.json"); // can't use variables in import

  // The locale may originate from user-controlled input (e.g. a `?cultureName=` query param).
  // Reject anything that isn't a plain locale identifier before using it to index the bundle map,
  // so it can't select an unexpected target or traverse paths (CodeQL: unvalidated dynamic method call).
  if (!LOCALE_ID_REGEX.test(locale)) {
    return import("../../../locales/en.json"); // can't use variables in import
  }

  const path = `${localesPathPrefix}/${locale}.json`;
  const shortPath = `${localesPathPrefix}/${locale?.slice(0, 2) ?? ""}.json`;

  if (locales[path]) {
    return locales[path]();
  } else if ((locale?.length ?? 0) > 2 && locales[shortPath]) {
    return locales[shortPath](); // try get short locale as a fallback (e.g. en-US.json -> en.json)
  }

  return import("../../../locales/en.json"); // can't use variables in import
}

async function initLocale(i18n: I18n, cultureName: string, options?: { rewriteUrl?: boolean }): Promise<void> {
  currentLanguage.value = supportedLanguages.value.find((x) => x.cultureName === cultureName);

  let messages = i18n.global.getLocaleMessage(cultureName);

  if (!Object.keys(messages).length) {
    messages = await fetchLocaleMessages(cultureName);
    i18n.global.setLocaleMessage(cultureName, messages);
  }

  (i18n.global as unknown as Composer).locale.value = cultureName;

  if (facetsCultureName.value && facetsCultureName.value !== cultureName) {
    removeFacetsFromUrl();
  }
  facetsCultureName.value = cultureName;

  setLocaleForYup({
    mixed: {
      required: i18n.global.t("common.messages.required_field"),
    },
    string: {
      email: i18n.global.t("common.messages.email_is_not_correct"),
      max: ({ max }) => i18n.global.t("common.messages.max_length", { max }),
    },
  });

  // In preview/designer mode the route is a fixed `/designer-preview` with vue-router base "",
  // so the locale must NOT be reflected as a `/{lang}` URL prefix — otherwise the pathname stops
  // matching the router base and the preview 404s. Callers pass `rewriteUrl: false` to keep the URL
  // intact while still switching the active locale (see VCST-5219).
  if (options?.rewriteUrl !== false) {
    const localeFromUrl = getLocaleFromUrl();
    const targetLocale = currentMaybeShortLocale.value;
    const isDefault = defaultStoreLanguage.value.cultureName === cultureName;

    let newPath = location.pathname;

    if (localeFromUrl) {
      // anchor at the start of the pathname and require / or end after the locale,
      // otherwise plain `replace("/de", "")` would eat the `de` inside paths like `/destinations`
      newPath = newPath?.replace(new RegExp(`^/${localeFromUrl}(?=/|$)`, "i"), "") || "/";
    }

    if (!isDefault) {
      // ensure non-default locale is reflected in the URL so vue-router's base matches the pathname
      newPath = newPath === "/" ? `/${targetLocale}` : `/${targetLocale}${newPath}`;
    }

    if (newPath !== location.pathname) {
      history.pushState(null, "", `${newPath}${location.search}${location.hash}`);
    }
  }

  document.documentElement.setAttribute("lang", cultureName);
}

/**
 * Fully applies a locale at runtime: base app messages (`initLocale`), per-culture number formats,
 * and every registered locale loader (UI kit, module bundles, …). This is the single shared
 * "switch the app language" entry point used by both storefront boot and the builder preview,
 * so the two can't silently diverge (VCST-5219).
 *
 * Loader failures are isolated and logged: a missing optional bundle must degrade to fallback
 * messages, never break the locale switch itself.
 */
async function applyLocale(i18n: I18n, cultureName: string, options?: { rewriteUrl?: boolean }): Promise<void> {
  await initLocale(i18n, cultureName, options);

  const { currentCurrency } = useCurrency();
  (i18n.global as unknown as Composer).mergeNumberFormat(
    cultureName,
    getDefaultNumberFormats(currentCurrency.value.code),
  );

  await runLocaleLoaders(i18n, currentLanguage.value ?? defaultStoreLanguage.value);
}

/**
 * Maps a raw, possibly user-supplied locale value ("fr", "fr-fr", "fr-FR") to the exact
 * `cultureName` of a supported store language, or `undefined` if no language matches.
 */
function normalizeToSupportedCulture(localeOrCultureName?: string): string | undefined {
  const value = localeOrCultureName?.toLowerCase();

  if (!value) {
    return undefined;
  }

  return supportedLanguages.value.find(
    (language) =>
      language.cultureName.toLowerCase() === value || language.twoLetterLanguageName.toLowerCase() === value,
  )?.cultureName;
}

function getLocaleFromUrl(): string | undefined {
  return supportedLocalesRegex.value.exec(location.pathname)?.groups?.locale;
}

function getPossibleLocaleFromUrl(fullPath?: string): string | undefined {
  const path = fullPath ?? location.pathname;
  const match = possibleLocaleRegex.value.exec(path);
  return match ? match.groups?.locale : undefined;
}

function removeLocaleFromUrl() {
  const fullPath = location.pathname + location.search + location.hash;

  const newUrl = getUrlWithoutLocale(fullPath);
  if (fullPath !== newUrl) {
    history.pushState(null, "", newUrl);
  }
}

// Facet term values are language-specific strings; called from initLocale() whenever the resolved
// culture no longer matches the one facetsCultureName was last set to.
function removeFacetsFromUrl() {
  const url = new URL(location.href);

  if (url.searchParams.has(QueryParamName.Facets)) {
    url.searchParams.delete(QueryParamName.Facets);
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }
}

function getUrlWithoutLocale(fullPath: string): string {
  const locale = supportedLocalesRegex.value.exec(fullPath)?.groups?.locale;

  if (locale) {
    return fullPath?.replace(supportedLocalesRegex.value, "/") ?? "";
  }

  return fullPath;
}

function getUrlWithoutPossibleLocale(fullPath: string): string {
  const path = fullPath;
  const match = possibleLocaleRegex.value.exec(path);

  if (match) {
    const idxToSlice = match[0].length;
    let result = path?.slice(idxToSlice) ?? "";

    if (!result?.startsWith("/")) {
      result = "/" + (result ?? "");
    }

    return result === "/" ? result : (result?.replaceAll(/\/+/g, "/") ?? "");
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
    const normalizedPermalink = permalink?.startsWith("/") ? permalink : `/${permalink}`;

    // Preserve a catalog namespace prefix (e.g. /loyalty-catalog) if the current URL is under one,
    // so that slug-driven replaceState calls don't drop it.
    const localePrefix = localeFromUrl ? `/${localeFromUrl}` : "";
    const pathnameWithoutLocale = localeFromUrl
      ? location.pathname.slice(localePrefix.length) || "/"
      : location.pathname;
    const basePath = getCatalogBasePath(pathnameWithoutLocale);

    history.replaceState(
      history.state,
      "",
      `${localePrefix}${basePath}${normalizedPermalink}${location.search}${location.hash}`,
    );
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
    applyLocale,
    resolveLocale,
    normalizeToSupportedCulture,
    fetchLocaleMessages,
    mergeLocalesMessages,

    pinLocale,
    unpinLocale,

    getLocaleFromUrl,
    getPossibleLocaleFromUrl,
    getUrlWithoutLocale,
    getUrlWithoutPossibleLocale,
    removeLocaleFromUrl,
    removeFacetsFromUrl,
    updateLocalizedUrl,
    resolvePossibleLocale,
  };
}
