import { createApp } from "vue";
import { createHead } from "@vueuse/head";
import { initCfg, initContext, initMenu } from "@core/utilities";
import { config, context, menu } from "@core/plugins";
import App from "./App.vue";
import * as yup from "yup";

/**
 * Global Styles
 */
import "@fortawesome/fontawesome-free/css/all.css";
import "@/assets/styles/main.scss";
import createI18nRouter, { currentCultureName, createI18nWithCurrentLocale } from "./i18n";
import routes from "./router";
import { loadMe } from "./shared/account/composables/useUser";

/**
 * Async application init
 */
(async () => {
  //Load user at first module import. Single request per app loading.
  await loadMe();

  // Load and prepare app config and context
  const [cfg, themeContext] = await Promise.all([initCfg(), initContext()]);

  const defaultLocale = themeContext.defaultLanguage?.twoLetterLanguageName || "en";
  const supportedLocales = themeContext.availLanguages?.map((x) => x.twoLetterLanguageName) || [defaultLocale];

  const i18n = await createI18nWithCurrentLocale({ defaultLocale, supportedLocales });
  const router = createI18nRouter(routes);

  const menus = await initMenu(currentCultureName.value);

  yup.setLocale({
    mixed: {
      required: i18n.global.t("common.messages.required_field"),
    },
    string: {
      email: i18n.global.t("common.messages.email_is_not_correct"),
      max: ({ max }) => i18n.global.t("common.messages.max_length", { max }),
    },
  });

  // Create and mount application
  const app = createApp(App);
  const head = createHead();

  app.use(config, cfg);
  app.use(context, themeContext);
  app.use(menu, menus);
  app.use(i18n);
  app.use(router);
  app.use(head);

  app.mount("#app");
})();
