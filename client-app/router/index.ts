import { createRouter as _createRouter, createWebHistory, RouteRecordName } from "vue-router";
import { mainRoutes } from "@/router/routes";
import { useUser } from "@/shared/account";
import { useAppContext } from "@/core";

export function createRouter(options: { base: string }) {
  const { storeSettings } = useAppContext();
  const { isAuthenticated, organization } = useUser();
  const { base } = options;

  const router = _createRouter({
    routes: mainRoutes,
    history: createWebHistory(base),
    scrollBehavior(to, from, savedPosition) {
      if (to.path !== from.path) {
        return savedPosition || { top: 0 };
      } else {
        return undefined;
      }
    },
  });

  router.beforeEach((to, _from, next) => {
    // Protecting routes
    if (
      (to.meta.requiresAuth || !storeSettings.anonymousAccessEnabled) &&
      !isAuthenticated.value &&
      to.name !== "SignIn"
    ) {
      return next({
        name: "SignIn",
        // save the location we were at to come back later
        query: { returnUrl: to.fullPath },
      });
    }

    // Protecting company routes
    if (to.meta.requiresOrganization && !organization.value) {
      return next({ name: "Account" });
    }

    // Make Dashboard the default Home page for authorized users
    if (
      isAuthenticated.value &&
      Array<RouteRecordName>(
        "Home",
        "SignIn",
        "SignUp",
        "ForgotPassword",
        "ResetPassword",
        "SetPassword",
        "ConfirmInvitation"
      ).includes(to.name!)
    ) {
      return next({ name: "Dashboard" });
    }

    return next();
  });

  return router;
}
