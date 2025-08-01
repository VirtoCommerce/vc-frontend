import { useApolloClient } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { filterActiveQueryNames } from "@/core/api/graphql";
import { OperationNames } from "@/core/api/graphql/types";
import { useThemeContext } from "@/core/composables";
import { DEFAULT_NOTIFICATION_DURATION } from "@/core/constants";
import { globals } from "@/core/globals";
import { getReturnUrlValue } from "@/core/utilities";
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
      await router.replace({ name: "Cart" });
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

    const { hash, pathname, search } = location;

    if (pathname !== ROUTES.SIGN_IN.PATH) {
      location.href = `${ROUTES.SIGN_IN.PATH}?returnUrl=${pathname + search + hash}`;
    }
  });
  on(graphqlErrorEvent, (error) => {
    notifications.error({
      duration: DEFAULT_NOTIFICATION_DURATION,
      group: "GraphqlError",
      text: t("common.messages.something_went_wrong"),
    });

    throw error;
  });
  on(unhandledErrorEvent, () => {
    notifications.error({
      duration: DEFAULT_NOTIFICATION_DURATION,
      group: "UnhandledError",
      singleInGroup: true,
      text: t("common.messages.unhandled_error"),
    });
  });
  on(openReturnUrl, () => {
    location.href = getReturnUrlValue() ?? themeContext.value.settings.default_return_url ?? "/";
  });

  on(forbiddenEvent, () => {
    void router.push({ name: "NoAccess" });
  });

  on(passwordExpiredEvent, () => {
    const { hash, pathname, search } = location;
    if (pathname !== "/change-password") {
      location.href = `/change-password?returnUrl=${pathname + search + hash}`;
    }
  });

  on(dataChangedEvent, () => {
    notifications.warning({
      text: t("common.messages.data_changed"),
      single: true,
    });
  });
}
