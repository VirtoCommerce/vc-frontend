import { createApp } from "vue";
import { initCfg, initContext } from "@core/utilities";
import { config, context } from "@core/plugins";
import App from "./App.vue";
import router from "./router";
import "@fortawesome/fontawesome-free/css/all.css";
import "./assets/styles/main.scss";

// Async application init
(async () => {
  // Load and prepare app config and context
  const [cfg, themeContext] = await Promise.all([initCfg(), initContext()]);

  // Create and mount application
  const app = createApp(App);

  app.use(config, cfg);
  app.use(context, themeContext);
  app.use(router);

  app.mount("#app");
})();
