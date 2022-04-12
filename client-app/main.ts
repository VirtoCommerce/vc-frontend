import { createApp } from "vue";
import { initCfg, initContext, initMenu } from "@core/utilities";
import { config, context, menu } from "@core/plugins";
import App from "./App.vue";

/**
 * Global Styles
 */
import "@fortawesome/fontawesome-free/css/all.css";
import "@/assets/styles/main.scss";
import { loadLocaleMessages, setI18nLocale, setupI18n } from "./i18n";
import setupRouter from "./router";

/**
 * Async application init
 */
(async () => {
  // Load and prepare app config and context
  const [cfg, themeContext] = await Promise.all([initCfg(), initContext()]);

  const defaultLocale = themeContext.defaultLanguage?.twoLetterLanguageName || "en";
  const supportedLocales = themeContext.availLanguages?.map((x) => x.twoLetterLanguageName) || [defaultLocale];

  // todo: move to plugin
  let locale = location.pathname.split("/")[1];
  let baseUrl;

  // use saved or default locale if path locale is not exists in available
  if (!supportedLocales.includes(locale)) {
    const savedLocale = localStorage.getItem("locale") as string;

    if (supportedLocales.includes(savedLocale)) {
      locale = savedLocale;
    } else {
      locale = defaultLocale;
    }
  }

  if (locale !== defaultLocale) {
    baseUrl = `${locale}`;
  }

  // todo: move to plugin
  const i18n = setupI18n({ defaultLocale, supportedLocales });
  const router = setupRouter(baseUrl);

  // set i18n language
  setI18nLocale(locale);

  // load locale messages if not yet
  if (i18n && !i18n.global.availableLocales.includes(locale)) {
    await loadLocaleMessages(locale);
  }

  const currentCultureName =
    themeContext.availLanguages?.find((x) => x.twoLetterLanguageName == locale)?.cultureName || "en-US";

  const menus = await initMenu(currentCultureName);

  // Create and mount application
  const app = createApp(App);

  app.use(config, cfg);
  app.use(context, themeContext);
  app.use(menu, menus);
  app.use(i18n);
  app.use(router);

  app.mount("#app");
})();
