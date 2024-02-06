import { useRouter } from "vue-router";
import { apolloClient, filterActiveQuerieNames } from "@/core/api/graphql";
import { OperationNames } from "@/core/api/graphql/types";
import { DEFAULT_NOTIFICATION_DURATION } from "@/core/constants";
import { globals } from "@/core/globals";
import { getReturnUrlValue } from "@/core/utilities";
import { useUser } from "@/shared/account";
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
} from "@/shared/broadcast";
import { useNotifications } from "@/shared/notification";

let installed = false;

export function setupBroadcastGlobalListeners() {
  if (installed) {
    throw new Error(`The "${setupBroadcastGlobalListeners.name}" function must be called once.`);
  }

  installed = true;

  const router = useRouter();
  const { on } = useBroadcast();
  const notifications = useNotifications();
  const { fetchUser, signMeOut, user } = useUser();

  on(pageReloadEvent, () => location.reload());
  on(userReloadEvent, () => fetchUser());
  on(userLockedEvent, async () => {
    await signMeOut({ reloadPage: false });
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
      await apolloClient.refetchQueries({
        include: filterActiveQuerieNames([OperationNames.Query.GetFullCart, OperationNames.Query.GetShortCart]),
      });
    }
  });
  on(unauthorizedErrorEvent, async () => {
    await fetchUser();

    if (user.value?.forcePasswordChange || user.value?.passwordExpired || user.value?.lockedState) {
      return;
    }

    const { hash, pathname, search } = location;

    if (pathname !== "/sign-in") {
      location.href = `/sign-in?returnUrl=${pathname + search + hash}`;
    }
  });
  on(unhandledErrorEvent, () => {
    const { t } = globals.i18n.global;
    notifications.error({
      duration: DEFAULT_NOTIFICATION_DURATION,
      group: "UnhandledError",
      singleInGroup: true,
      text: t("common.messages.unhandled_error"),
    });
  });
  on(openReturnUrl, () => {
    location.href = getReturnUrlValue() || "/";
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
}
