import { createApp } from "vue";
import { initCfg, initContext, initMenu } from "@core/utilities";
import { config, context, menu } from "@core/plugins";
import App from "./App.vue";

/**
 * Global Styles
 */
import "@fortawesome/fontawesome-free/css/all.css";
import "@/assets/styles/main.scss";
import { setupI18n } from "./i18n";
import setupRouter from "./router";

/**
 * Async application init
 */
(async () => {
  // Load and prepare app config and context
  const [cfg, themeContext, menus] = await Promise.all([initCfg(), initContext(), initMenu()]);

  // todo: move to plugin
  const defaultLocale = themeContext.defaultLanguage?.twoLetterLanguageName || "en";
  const supportedLocales = themeContext.availLanguages?.map((x) => x.twoLetterLanguageName) || [defaultLocale];

  const i18n = setupI18n({ defaultLocale, supportedLocales });
  const router = setupRouter();

  // Create and mount application
  const app = createApp(App);

  app.use(config, cfg);
  app.use(context, themeContext);
  app.use(menu, menus);
  app.use(i18n);
  app.use(router);

  app.mount("#app");
})();
