import { createApp } from "vue";
import { initCfg, initContext, initMenu } from "@core/utilities";
import { config, context, menu } from "@core/plugins";
import App from "./App.vue";
import router from "./router";
import { createI18n } from "vue-i18n";

/**
 * Translated locale messages
 * @see https://github.com/intlify/bundle-tools/tree/main/packages/vite-plugin-vue-i18n#static-bundle-importing
 */
import messages from "@intlify/vite-plugin-vue-i18n/messages"; // eslint-disable-line import/no-unresolved

/**
 * Global Styles
 */
import "@fortawesome/fontawesome-free/css/all.css";
import "@/assets/styles/main.scss";

/**
 * Async application init
 */
(async () => {
  // Load and prepare app config and context
  const [cfg, themeContext, menus] = await Promise.all([initCfg(), initContext(), initMenu()]);

  const i18n = createI18n({
    messages,
    legacy: false,
    globalInjection: true,
    fallbackLocale: "en-US",
    locale: themeContext.language,
  });

  // Create and mount application
  const app = createApp(App);

  app.use(config, cfg);
  app.use(context, themeContext);
  app.use(menu, menus);
  app.use(i18n);
  app.use(router);

  app.mount("#app");
})();
