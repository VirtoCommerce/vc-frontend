import { useApolloClient } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { filterActiveQueryNames } from "@/core/api/graphql";
import { OperationNames } from "@/core/api/graphql/types";
import { useThemeContext } from "@/core/composables";
import { DEFAULT_NOTIFICATION_DURATION } from "@/core/constants";
import { globals } from "@/core/globals";
import { getReturnUrlValue } from "@/core/utilities";
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
} from "@/shared/broadcast";
import { useModal } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import { useEnvironmentName } from "./core/composables/useEnvironmentName";
import VcConfirmationModal from "./ui-kit/components/organisms/confirmation-modal/vc-confirmation-modal.vue";
import type { INotification } from "@/shared/notification";

let installed = false;

export function setupBroadcastGlobalListeners() {
  if (installed) {
    throw new Error(`The "${setupBroadcastGlobalListeners.name}" function must be called once.`);
  }

  installed = true;

  const { client } = useApolloClient();
  const router = useRouter();
  const { on } = useBroadcast();
  const notifications = useNotifications();
  const { fetchUser, user } = useUser();
  const { signMeOut } = useSignMeOut({ reloadPage: false });
  const { themeContext } = useThemeContext();
  const { environmentName } = useEnvironmentName();
  const { closeModal, openModal } = useModal();

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

    if (pathname !== "/sign-in") {
      location.href = `/sign-in?returnUrl=${pathname + search + hash}`;
    }
  });
  on(unhandledErrorEvent, (data) => {
    const { t } = globals.i18n.global;

    const notification: INotification = {
      duration: DEFAULT_NOTIFICATION_DURATION,
      group: "UnhandledError",
      singleInGroup: true,
      text: t("common.messages.unhandled_error"),
    };

    if (data) {
      notification.text = t("common.messages.something_went_wrong");

      if (environmentName?.toLowerCase() === "dev") {
        notification.button = {
          text: "Show details",
          clickHandler: () => {
            notifications.clear();
            openModal({
              component: VcConfirmationModal,
              props: {
                singleButton: true,
                text: data as string,
                title: t("common.titles.error_details"),
                onConfirm() {
                  closeModal();
                },
              },
            });
          },
        };
      }
    }

    notifications.error(notification);
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
}
