import { createRouter as _createRouter, createWebHistory } from "vue-router";
import { useThemeContext } from "@/core/composables";
import { buildRedirectUrl, getReturnUrlValue } from "@/core/utilities";
import { ROUTES } from "@/router/routes/constants";
import { useUser } from "@/shared/account";
import { mainRoutes } from "./routes";
import { saveUcpContinuation } from "./routes/ucp-continuation";
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

  router.beforeEach((to, _, next) => {
    const isCheckout = to.matched.some((route) => route.name === "Checkout");
    if (isCheckout && typeof to.query.ucp_session === "string") {
      const { ucp_session, ...query } = to.query;
      try {
        const reference = saveUcpContinuation(ucp_session);
        return next({ path: to.path, query: { ...query, ucp_resume: reference }, hash: to.hash, replace: true });
      } catch {
        // Continue to the route's local error UI without reflecting the token into a sign-in URL.
        return next({ path: to.path, query: { ...query, ucp_resume: "unavailable" }, replace: true });
      }
    }

    // Protecting routes
    const unauthorizedAccessIsDenied: boolean =
      !isAuthenticated.value &&
      !to.meta.public &&
      (to.meta.requiresAuth || !themeContext.value.storeSettings.anonymousUsersAllowed);

    if (unauthorizedAccessIsDenied) {
      // save current location to return to it after sign in
      const isUcpHandoff = isCheckout && typeof to.query.ucp_resume === "string";
      const query =
        isUcpHandoff || to.name === "OAuthAuthorize" ? { returnUrl: to.fullPath } : buildRedirectUrl(to) || {};

      return next({
        name: ROUTES.SIGN_IN.NAME,
        query,
      });
    }

    // Protecting company routes
    if (to.meta.requiresOrganization && !organization.value) {
      return next({ name: "Account" });
    }

    // Make Dashboard the default Home page for authorized users
    if (
      isAuthenticated.value &&
      !(to.name === ROUTES.SIGN_IN.NAME && to.query.reauthenticate === "1") &&
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
      return next(getReturnUrlValue() || { name: ROUTES.CATALOG.NAME });
    }

    return next();
  });

  return router;
}
