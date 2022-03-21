import { createApp } from "vue";
import { initCfg, initContext, initMenu } from "@core/utilities";
import { config, context, menu } from "@core/plugins";
import App from "./App.vue";
import router from "./router";
import "@fortawesome/fontawesome-free/css/all.css";
import "./assets/styles/main.scss";

// Async application init
(async () => {
  // Load and prepare app config and context
  const cfg = await initCfg();
  const themeContext = await initContext();
  const menus = await initMenu();

  // Create and mount application
  const app = createApp(App);
  app.use(config, cfg);
  app.use(context, themeContext);
  app.use(menu, menus);
  app.use(router);
  app.mount("#app");
})();
