import { createApp } from "vue";
import { initCfg } from "@core/utilities";
import { config } from "@core/plugins";
import App from "./App.vue";
import router from "./router";
import "@fortawesome/fontawesome-free/css/all.css";
import "./assets/styles/main.scss";

// Async application init
(async () => {
  // Load and prepare app config
  const cfg = await initCfg();

  // Create and mount application
  const app = createApp(App);
  app.use(config, cfg);
  app.use(router);
  app.mount("#app");
})();
