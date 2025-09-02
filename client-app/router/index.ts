import { createRouter as _createRouter, createWebHistory } from "vue-router";
import { useThemeContext } from "@/core/composables";
import { globals } from "@/core/globals";
import { getReturnUrlValue } from "@/core/utilities";
import { ROUTES } from "@/router/routes/constants";
import { resolveLocalizedRedirect, withLocalizedAliases } from "@/router/routes/localization";
import { useUser } from "@/shared/account";
import { mainRoutes } from "./routes";
import type { RouteRecordName } from "vue-router";

export function createRouter(options: { base: string }) {
  const { base } = options;
  const { isAuthenticated, organization } = useUser();
  const { themeContext } = useThemeContext();

  const router = _createRouter({
    routes: withLocalizedAliases(mainRoutes),
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
    // Normalize generic paths to current-locale paths (e.g., "/cart" -> "/carrinho") while preserving the visible URL
    // Only rewrite when navigating via named routes or plain paths that match a localized mapping
    const twoLetterFromCulture = globals.cultureName?.slice(0, 2);
    const currentLocale = twoLetterFromCulture ?? themeContext.value.defaultLanguage.twoLetterLanguageName;

    const redirect = resolveLocalizedRedirect(to, currentLocale);
    if (redirect) {
      return next(redirect);
    }

    // Protecting routes
    const unauthorizedAccessIsDenied: boolean =
      !isAuthenticated.value &&
      !to.meta.public &&
      (to.meta.requiresAuth || !themeContext.value.storeSettings.anonymousUsersAllowed);

    if (unauthorizedAccessIsDenied) {
      return next({
        name: ROUTES.SIGN_IN.NAME,
        // save current location to return to it after sign in
        query: { returnUrl: to.fullPath },
      });
    }

    // Protecting company routes
    if (to.meta.requiresOrganization && !organization.value) {
      return next({ name: "Account" });
    }

    // TODO: Need refactoring
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
      return next(getReturnUrlValue() || { name: ROUTES.CATALOG.NAME });
    }

    return next();
  });

  return router;
}
