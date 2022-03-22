import { createApp } from "vue";
import { initCfg, initContext, initMenu } from "@core/utilities";
import { config, context, menu } from "@core/plugins";
import App from "./App.vue";
import router from "./router";
import "@fortawesome/fontawesome-free/css/all.css";
import "./assets/styles/main.scss";
import { createI18n } from "vue-i18n";

/*eslint import/no-unresolved: [2, { ignore: ['@intlify\/vite\-plugin\-vue\-i18n\/messages'] }]*/
import messages from "@intlify/vite-plugin-vue-i18n/messages";

// Async application init
(async () => {
  // Load and prepare app config and context
  const [cfg, themeContext, menus] = await Promise.all([initCfg(), initContext(), initMenu()]);

  // Create and mount application
  const app = createApp(App);

  app.use(config, cfg);
  app.use(context, themeContext);
  app.use(menu, menus);

  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: themeContext.language,
    messages: messages,
  });

  app.use(i18n);
  app.use(router);

  app.mount("#app");
})();
