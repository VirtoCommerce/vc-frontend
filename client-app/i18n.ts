import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { createI18n, I18n } from "vue-i18n";
import { computed, nextTick } from "vue";
import { themeContext } from "./core/utilities";

export let defaultLocale: string;
export let supportedLocales: string[];

// global instance of VueI18n
export let i18n: I18n<unknown, unknown, unknown, false> | null = null;

export const currentCultureName = computed(
  () =>
    themeContext.availLanguages?.find((x) => x.twoLetterLanguageName === i18n?.global.locale.value)?.cultureName ||
    "en-US"
);

export async function createI18nWithCurrentLocale(options: { defaultLocale: string; supportedLocales: string[] }) {
  defaultLocale = options.defaultLocale;
  supportedLocales = options.supportedLocales;

  const i18nInstance = createI18n({
    legacy: false,
    globalInjection: true,
    fallbackLocale: defaultLocale,
    locale: defaultLocale,
    messages: {},
  });

  i18n = i18nInstance;

  // load default locale messages for fallback
  await loadLocaleMessages(defaultLocale);

  const locale = getCurrentLocaleByPath();

  // set i18n language
  setI18nLocale(locale);

  // load locale messages if not yet
  if (i18n && !i18n.global.availableLocales.includes(locale)) {
    await loadLocaleMessages(locale);
  }

  return i18n;
}

function getCurrentLocaleByPath() {
  let locale = location.pathname.split("/")[1];

  // use saved or default locale if path locale is not exists in available
  if (!supportedLocales.includes(locale)) {
    const savedLocale = localStorage.getItem("locale") as string;

    if (supportedLocales.includes(savedLocale)) {
      locale = savedLocale;
    } else {
      locale = defaultLocale;
    }
  }

  return locale;
}

// create router with locale aliases and history with the base as locale
export default function createI18nRouter(routes: RouteRecordRaw[]) {
  const locale = i18n?.global.locale.value as string;
  let baseUrl;
  if (locale !== defaultLocale) {
    baseUrl = `${locale}`;
  }

  addLocaleAliasToRoutes(routes, locale);

  const router = createRouter({
    routes,

    // History mode
    history: createWebHistory(baseUrl),

    // Setup scroll behavior on route change
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition;
      } else {
        return {
          top: 0,
          behavior: "smooth",
        };
      }
    },
  });

  return router;
}

// save locale to local storage
export function saveLocale(locale: string) {
  localStorage.setItem("locale", locale);
}

function setI18nLocale(locale: string) {
  if (!i18n) {
    throw new Error("i18n is not instanced");
  }

  i18n.global.locale.value = locale;
  saveLocale(locale);
  document?.querySelector("html")?.setAttribute("lang", locale);
}

async function loadLocaleMessages(locale: string) {
  if (!i18n) {
    throw new Error("i18n is not instanced");
  }
  try {
    // load locale messages with dynamic import
    const messages = await import(/* webpackChunkName: "locale-[request]" */ `../locales/${locale}.json`);

    // add locale messages to i18n global
    i18n.global.setLocaleMessage(locale, messages.default);
  } catch (err) {
    console.log(
      `Localization file for '${locale}' locale was not found. An fallback locale will be used for this locale.`
    );
  }

  return nextTick();
}

// add to each route alias with locale segment at start. ex. '/checkout' => '/de/checkout
function addLocaleAliasToRoutes(routes: RouteRecordRaw[], locale: string, child = false) {
  routes.forEach((route) => {
    let alias = route.path;

    if (!child) {
      alias = `/${locale}${alias.charAt(0) !== "/" ? "/" : ""}${alias}`;
    }

    // Make sure alias array exists
    if (route.alias) {
      if (!Array.isArray(route.alias)) {
        route.alias = [route.alias];
      }
    } else {
      route.alias = [];
    }

    // Push alias into alias array
    if (route.path !== alias && route.alias.indexOf(alias) === -1) {
      route.alias.push(alias);
    }

    // If the route has children, iterate over those too
    if (route.children) {
      addLocaleAliasToRoutes(route.children, locale, true);
    }
  });
}
