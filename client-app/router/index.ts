import { createRouter as _createRouter, createWebHistory } from "vue-router";
import { useThemeContext } from "@/core/composables";
import { useLanguages } from "@/core/composables/useLanguages";
import { buildRedirectUrl, getReturnUrlValue } from "@/core/utilities";
import { updateRouteWithLocale } from "@/core/utilities/localization";
import { ROUTES } from "@/router/routes/constants";
import { useUser } from "@/shared/account";
import { mainRoutes } from "./routes";
import type { RouteRecordName } from "vue-router";

export function createRouter(options: { base?: string } = {}) {
  const { base } = options;
  const { isAuthenticated, organization } = useUser();
  const { themeContext } = useThemeContext();
  const { isDefaultLanguageInUse, currentLanguage } = useLanguages();

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
    const localeParam = isDefaultLanguageInUse.value ? "" : currentLanguage.value.twoLetterLanguageName;

    // Protecting routes
    const unauthorizedAccessIsDenied: boolean =
      !isAuthenticated.value &&
      !to.meta.public &&
      (to.meta.requiresAuth || !themeContext.value.storeSettings.anonymousUsersAllowed);

    if (unauthorizedAccessIsDenied) {
      // save current location to return to it after sign in
      const query = buildRedirectUrl(to) || {};

      return next(
        updateRouteWithLocale(
          {
            name: ROUTES.SIGN_IN.NAME,
            query,
          },
          localeParam,
        ),
      );
    }

    // Protecting company routes
    if (to.meta.requiresOrganization && !organization.value) {
      return next(updateRouteWithLocale({ name: "Account" }, localeParam));
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
      const returnUrl = updateRouteWithLocale(getReturnUrlValue() || { name: ROUTES.CATALOG.NAME }, localeParam);
      return next(returnUrl);
    }

    return next(updateRouteWithLocale(to, localeParam));
  });

  return router;
}
