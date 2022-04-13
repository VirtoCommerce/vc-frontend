import { RouteRecordRaw } from "vue-router";
import { createI18n, I18n } from "vue-i18n";
import { nextTick } from "vue";

export let defaultLocale: string;

export let supportedLocales: string[];

// global instance of VueI18n
export let i18n: I18n<unknown, unknown, unknown, false> | null = null;

export function setupI18n(options: { defaultLocale: string; supportedLocales: string[] }) {
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

  return i18n;
}

export function saveLocale(locale: string) {
  localStorage.setItem("locale", locale);
}

export function setI18nLocale(locale: string) {
  if (!i18n) {
    throw new Error("i18n is not instanced");
  }

  i18n.global.locale.value = locale;
  saveLocale(locale);
  document?.querySelector("html")?.setAttribute("lang", locale);
}

export async function loadLocaleMessages(locale: string) {
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
export function addLocaleAliasToRoutes(routes: RouteRecordRaw[], locale: string, child = false) {
  routes.forEach((route) => {
    let alias = route.path;

    if (!child) {
      alias = `/${locale}${alias.charAt(0) != "/" ? "/" : ""}${alias}`;
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
    if (route.path != alias && route.alias.indexOf(alias) == -1) {
      route.alias.push(alias);
    }

    // If the route has children, iterate over those too
    if (route.children) {
      addLocaleAliasToRoutes(route.children, locale, true);
    }
  });
}
