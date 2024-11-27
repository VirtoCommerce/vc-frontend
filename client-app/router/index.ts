import { createRouter as _createRouter, createWebHistory } from "vue-router";
import { useThemeContext } from "@/core/composables";
import { getReturnUrlValue } from "@/core/utilities";
import { useUser } from "@/shared/account";
import { mainRoutes } from "./routes";
import type { RouteRecordName } from "vue-router";

export function createRouter(options: { base: string }) {
  const { base } = options;
  const { isAuthenticated, organization } = useUser();
  const { themeContext } = useThemeContext();

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
    const unauthorizedAccessIsDenied: boolean =
      !isAuthenticated.value &&
      !to.meta.public &&
      (to.meta.requiresAuth || !themeContext.value.storeSettings.anonymousUsersAllowed);

    if (unauthorizedAccessIsDenied) {
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
        "ConfirmInvitation",
      ).includes(to.name!)
    ) {
      return next(getReturnUrlValue() || { name: "Home" });
    }

    return next();
  });

  return router;
}
