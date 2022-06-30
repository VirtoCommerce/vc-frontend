import { createRouter as _createRouter, createWebHistory, RouteRecordName } from "vue-router";
import { mainRoutes } from "@/router/routes";
import { useUser } from "@/shared/account";

export function createRouter(options: { base: string }) {
  const { isAuthenticated } = useUser();
  const { base } = options;

  const router = _createRouter({
    routes: mainRoutes,
    history: createWebHistory(base),
    scrollBehavior(to, from, savedPosition) {
      return savedPosition || { top: 0, behavior: "smooth" };
    },
  });

  router.beforeEach((to, _from, next) => {
    // Protect account routes
    if (!isAuthenticated.value && to.meta.requiresAuth) {
      return next({
        name: "SignIn",
        // save the location we were at to come back later
        query: { redirect: to.fullPath },
      });
    }

    // Make Dashboard the default Home page for authorized users
    if (isAuthenticated.value && Array<RouteRecordName>("Home", "SignIn", "SignUp").includes(to.name!)) {
      return next({ name: "Dashboard" });
    }

    return next();
  });

  return router;
}
