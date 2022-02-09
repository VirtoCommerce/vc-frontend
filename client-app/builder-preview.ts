import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@fortawesome/fontawesome-free/css/all.css";
import "./assets/styles/index.css";

import builderPreview from "./builder-preview/BuilderPreview";

const app = createApp(App);

app.config.performance = true;

app.use(router);
app.use(builderPreview);
app.mount("#app");
