import { useApolloClient } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { filterActiveQueryNames, getFieldValidationErrors } from "@/core/api/graphql";
import { OperationNames } from "@/core/api/graphql/types";
import { useAuth, useReturnUrl, useSupportReports } from "@/core/composables";
import { globals } from "@/core/globals";
import { buildRedirectUrl, toSameOriginPath } from "@/core/utilities";
import { ROUTES } from "@/router/routes/constants";
import { useSignMeOut, useUser } from "@/shared/account";
import {
  cartReloadEvent,
  pageReloadEvent,
  userReloadEvent,
  unauthorizedErrorEvent,
  useBroadcast,
  openReturnUrl,
  unhandledErrorEvent,
  userLockedEvent,
  forbiddenEvent,
  passwordExpiredEvent,
  reloadAndOpenMainPage,
  graphqlErrorEvent,
  dataChangedEvent,
} from "@/shared/broadcast";
import { useFieldErrors } from "@/shared/common";
import { closeAllModals } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import type { INotification, NotificationCustomButtonType } from "@/shared/notification";
import type { GraphQLFormattedError } from "graphql";

let installed = false;

export function setupBroadcastGlobalListeners() {
  if (installed) {
    throw new Error(`The "${setupBroadcastGlobalListeners.name}" function must be called once.`);
  }

  installed = true;

  const { t } = globals.i18n.global;

  const { client } = useApolloClient();
  const router = useRouter();
  const { on } = useBroadcast();
  const notifications = useNotifications();
  const { fetchUser, user, isAuthenticated } = useUser();
  const { headers: authHeaders } = useAuth();
  const { signMeOut } = useSignMeOut({ reloadPage: false });
  const { getReturnUrl } = useReturnUrl();
  const { report } = useSupportReports();
  const { getErrorNotification } = useFieldErrors();

  function createReportButton(error: unknown): NotificationCustomButtonType {
    return {
      text: t("common.buttons.report_a_problem"),
      color: "secondary",
      variant: "outline",
      clickHandler: (notificationId: string) => {
        report({ error: error });

        notifications.update(notificationId, {
          duration: 5000,
          type: "success",
          text: t("common.messages.report_sent_successfully"),
          variant: "solid",
          button: undefined,
        });
      },
    };
  }

  on(pageReloadEvent, () => location.reload());
  on(reloadAndOpenMainPage, () => {
    location.href = "/";
  });
  on(userReloadEvent, () => fetchUser());
  on(userLockedEvent, async () => {
    await signMeOut();

    const { pathname } = location;

    if (pathname !== "/blocked") {
      location.href = "/blocked";
    }
  });
  on(cartReloadEvent, async () => {
    const route = router.currentRoute.value;

    if (route.matched.some((item) => item.name === "Checkout")) {
      closeAllModals();
      await router.replace({
        name: route.params.cartId ? "SharedCart" : "Cart",
        params: { cartId: route.params.cartId },
      });
    } else {
      await client.refetchQueries({
        include: filterActiveQueryNames(client, [OperationNames.Query.GetFullCart, OperationNames.Query.GetShortCart]),
      });
      client.cache.gc();
    }
  });
  let signInRedirect: Promise<void> | undefined;

  // A failed token refresh emits unauthorizedErrorEvent and lets the request go out without a token, so a
  // forbiddenEvent follows. Both handlers share one run: one `me` request and one navigation, in either order.
  function redirectToSignIn(): Promise<void> {
    signInRedirect ??= reloadUserAndRedirectToSignIn().finally(() => {
      signInRedirect = undefined;
    });
    return signInRedirect;
  }

  // The router sends a user it still holds as signed in away from Sign In, so the user is reloaded first
  async function reloadUserAndRedirectToSignIn(): Promise<void> {
    const wasSignedIn = isAuthenticated.value;

    await fetchUser();

    if (user.value?.forcePasswordChange || user.value?.passwordExpired || user.value?.lockedState) {
      return;
    }

    const route = router.currentRoute.value;

    if (route.name === ROUTES.SIGN_IN.NAME) {
      return;
    }

    const query = buildRedirectUrl(route);
    // A page that can't be returned to is left only by a user whose session is gone: a guest stays on their checkout,
    // and Sign In sends a user who is still signed in on to the catalog.
    const sessionGone = wasSignedIn && !isAuthenticated.value;

    if (query || (sessionGone && route.meta.redirectable === false && !route.meta.public)) {
      const navigation = router.push({ name: ROUTES.SIGN_IN.NAME, query: query ?? undefined });
      closeAllModals();
      // Awaited so that the run lasts until Sign In is open: the 403 of the same dead session then joins it
      await navigation;
    }
  }

  on(unauthorizedErrorEvent, async () => {
    await redirectToSignIn();
  });
  on(graphqlErrorEvent, (errors) => {
    const graphQLErrors = errors as GraphQLFormattedError[];
    const fieldErrors = getFieldValidationErrors(graphQLErrors);
    const notification = getErrorNotification(fieldErrors);

    // Rejected input is for the user to correct; any other error is a problem to report
    if (fieldErrors.length < graphQLErrors.length) {
      notification.button = createReportButton(graphQLErrors);
    }

    notifications.error({
      ...notification,
    });
  });
  on(unhandledErrorEvent, (error) => {
    const notification: INotification = {
      variant: "outline-dark",
      group: "GenericError",
      singleInGroup: true,
      text: t("common.messages.unhandled_error"),
    };

    if (error) {
      notification.button = {
        text: t("common.buttons.report_a_problem"),
        color: "secondary",
        variant: "outline",
        clickHandler: (notificationId: string) => {
          report({ error: error });
          notifications.update(notificationId, {
            duration: 5000,
            type: "success",
            text: t("common.messages.report_sent_successfully"),
            variant: "solid",
            button: undefined,
          });
        },
      };
    }

    notifications.error({
      ...notification,
    });
  });
  on(openReturnUrl, (returnUrl) => {
    location.href = toSameOriginPath(typeof returnUrl === "string" ? returnUrl : getReturnUrl());
  });

  on(forbiddenEvent, async () => {
    if (!authHeaders.value.Authorization) {
      // No token while the user is still held as signed in, or while that user is on the way to Sign In: the session
      // is gone, not the permission
      if (isAuthenticated.value || signInRedirect) {
        await redirectToSignIn();
        return;
      }

      // The 403 of a dead session can also arrive after its redirect, when only the page tells it from a guest's
      if (router.currentRoute.value.name === ROUTES.SIGN_IN.NAME) {
        return;
      }
    }

    if (router.currentRoute.value.name !== "NoAccess") {
      void router.push({ name: "NoAccess" });
      closeAllModals();
    }
  });

  on(passwordExpiredEvent, () => {
    const query = buildRedirectUrl(router.currentRoute.value);

    if (query && router.currentRoute.value.name !== ROUTES.CHANGE_PASSWORD.NAME) {
      void router.push({ name: ROUTES.CHANGE_PASSWORD.NAME, query });
      closeAllModals();
    }
  });

  on(dataChangedEvent, () => {
    notifications.warning({
      group: "DataChanged",
      singleInGroup: true,
      text: t("common.messages.data_changed"),
    });
  });
}
