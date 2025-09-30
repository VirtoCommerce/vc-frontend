import { createRouter as _createRouter, createWebHistory } from "vue-router";
import { useThemeContext } from "@/core/composables";
import { buildRedirectUrl, getReturnUrlValue } from "@/core/utilities";
import { ROUTES } from "@/router/routes/constants";
import { useUser } from "@/shared/account";
import { getMainRoutes } from "./routes";
import type { RouteRecordName } from "vue-router";

export function createRouter(options: { base?: string; supportedLocales?: string[] } = {}) {
  const { base, supportedLocales = [] } = options;
  const { isAuthenticated, organization } = useUser();
  const { themeContext } = useThemeContext();

  const router = _createRouter({
    routes: getMainRoutes(supportedLocales),
    history: createWebHistory(base),
    scrollBehavior(to, from, savedPosition) {
      if (to.path !== from.path) {
        return savedPosition || { top: 0 };
      } else {
        return undefined;
      }
    },
  });

  router.beforeEach((to) => {
    // Protecting routes
    const unauthorizedAccessIsDenied: boolean =
      !isAuthenticated.value &&
      !to.meta.public &&
      (to.meta.requiresAuth || !themeContext.value.storeSettings.anonymousUsersAllowed);

    if (unauthorizedAccessIsDenied) {
      // save current location to return to it after sign in
      const query = buildRedirectUrl(to) || {};

      return {
        name: ROUTES.SIGN_IN.NAME,
        query,
      };
    }

    // Protecting company routes
    if (to.meta.requiresOrganization && !organization.value) {
      return { name: "Account" };
    }

    // Make Dashboard the default Home page for authorized users
    if (
      isAuthenticated.value &&
      Array<RouteRecordName>(
        "Home",
        ROUTES.SIGN_IN.NAME,
        "SignUp",
        "ForgotPassword",
        "ResetPassword",
        "SetPassword",
        "ConfirmInvitation",
      ).includes(to.name)
    ) {
      const returnUrl = getReturnUrlValue() || { name: ROUTES.CATALOG.NAME };
      return returnUrl;
    }

    return true;
  });

  return router;
}
