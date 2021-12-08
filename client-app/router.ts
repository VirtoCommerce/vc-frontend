import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/home/home.vue";
import SingInPage from "./pages/sign-in/sign-in-page.vue";
import Catalog from "./pages/catalog/catalog.vue";
import Error403 from "./pages/403/403.vue";
import Error404 from "./pages/404/404.vue";
import Error500 from "./pages/500/500.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "Home", component: Home },
    { path: "/sign-in", name: "SignIn", component: SingInPage },
    { path: "/catalog", name: "Catalog", component: Catalog },
    { path: "/500", name: "InternalError", component: Error500 },
    { path: "/403", name: "NoAccess", component: Error403 },
    { path: "/:pathMatch(.*)*", name: "NotFound", component: Error404 },
  ],
});

export default router;
