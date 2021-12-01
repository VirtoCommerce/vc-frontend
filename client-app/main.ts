import { createApp } from "vue";
import App from "./App.vue";
import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/home/home.vue";
import Error404 from "./pages/404/404.vue";
import Error500 from "./pages/500/500.vue";
import Error403 from "./pages/403/403.vue";
import "@fontsource/lato";
import "@fontsource/roboto";
import "@fortawesome/fontawesome-free/css/all.css";
import SingInPage from "./pages/sign-in/sign-in-page.vue";
import "../assets/static/styles/index.css";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "Home", component: Home },
    { path: "/signIn", name: "SignIn", component: SingInPage },
    { path: "/500", name: "InternalError", component: Error500 },
    { path: "/403", name: "NoAccess", component: Error403 },
    { path: "/:pathMatch(.*)*", name: "NotFound", component: Error404 },
  ],
});

const app = createApp(App);
app.use(router);
app.mount("#app");
