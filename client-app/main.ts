import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@fortawesome/fontawesome-free/css/all.css";
import "./assets/styles/index.css";
import pages from "./builder-preview/pages/blocks";

const app = createApp(App);

Object.keys(pages).forEach((key) => app.component(key, pages[key]));

app.use(router);
app.mount("#app");
