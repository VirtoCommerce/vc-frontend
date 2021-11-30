import { createApp } from "vue";
import App from "./App.vue";
import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/home/home.vue";
import Error404 from "./pages/404/404.vue";
import "../assets/static/styles/index.css";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "Home", component: Home },
    { path: "/:pathMatch(.*)*", name: "NotFound", component: Error404 },
  ],
});

const app = createApp(App);
app.use(router);
app.mount("#app");
