import { useApolloClient } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { filterActiveQueryNames } from "@/core/api/graphql";
import { OperationNames } from "@/core/api/graphql/types";
import { useSupportReports, useThemeContext } from "@/core/composables";
import { DEFAULT_NOTIFICATION_DURATION } from "@/core/constants";
import { globals } from "@/core/globals";
import { buildRedirectUrl, getReturnUrlValue } from "@/core/utilities";
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
import { useNotifications } from "@/shared/notification";
import type { INotification } from "@/shared/notification";

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
  const { fetchUser, user } = useUser();
  const { signMeOut } = useSignMeOut({ reloadPage: false });
  const { themeContext } = useThemeContext();
  const { report } = useSupportReports();

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
  on(unauthorizedErrorEvent, async () => {
    await fetchUser();

    if (user.value?.forcePasswordChange || user.value?.passwordExpired || user.value?.lockedState) {
      return;
    }

    const query = buildRedirectUrl(router.currentRoute.value);
    if (query && router.currentRoute.value.name !== ROUTES.SIGN_IN.NAME) {
      void router.push({ name: ROUTES.SIGN_IN.NAME, query });
    }
  });
  on(graphqlErrorEvent, (error) => {
    const notification: INotification = {
      duration: DEFAULT_NOTIFICATION_DURATION,
      variant: "outline-dark",
      group: "GenericError",
      singleInGroup: true,
      text: t("common.messages.something_went_wrong"),
    };

    if (error) {
      notification.button = {
        text: t("common.buttons.report_a_problem"),
        color: "secondary",
        variant: "outline",
        clickHandler: () => {
          report({ error: error });
        },
      };
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
        clickHandler: () => {
          report({ error: error });
        },
      };
    }

    notifications.error({
      ...notification,
    });
  });
  on(openReturnUrl, () => {
    location.href = getReturnUrlValue() ?? themeContext.value.settings.default_return_url ?? "/";
  });

  on(forbiddenEvent, () => {
    void router.push({ name: "NoAccess" });
  });

  on(passwordExpiredEvent, () => {
    const query = buildRedirectUrl(router.currentRoute.value);

    if (query && router.currentRoute.value.name !== ROUTES.CHANGE_PASSWORD.NAME) {
      void router.push({ name: ROUTES.CHANGE_PASSWORD.NAME, query });
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
