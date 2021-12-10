import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@fontsource/lato";
import "@fontsource/roboto";
import "@fontsource/roboto-condensed";
import "@fortawesome/fontawesome-free/css/all.css";
import "../assets/static/styles/index.css";

const app = createApp(App);
app.use(router);
app.mount("#app");
