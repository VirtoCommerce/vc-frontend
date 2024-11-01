import { defineAsyncComponent } from "vue";
import { useNavigations } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { MODULE_ID_PUSH_MESSAGES } from "@/core/constants/modules";
import { useUser } from "@/shared/account/composables/useUser";
import { useCustomHeaderLinkComponents } from "@/shared/layout/composables/useCustomHeaderLinkComponents";
import { useCustomMobileMenuLinkComponents } from "@/shared/layout/composables/useCustomMobileMenuLinkComponents";
import { PUSH_MESSAGES_MODULE_ENABLED_KEY, PUSH_MESSAGES_MODULE_FCM_ENABLED_KEY } from "./constants";
import type { MenuType } from "@/core/types";
import type { ElementType } from "@/shared/layout/composables/useCustomHeaderLinkComponents";
import type { DeepPartial } from "utility-types";
import type { Router, RouteRecordRaw } from "vue-router";

const REGISTRATION_SCOPE = "/firebase-cloud-messaging-push-scope";

const menuItems: DeepPartial<MenuType> = {
  header: {
    mobile: {
      account: {
        children: [
          {
            id: "push-messages",
            route: {
              name: "Notifications",
            },
            title: "shared.layout.header.mobile.account_menu.notifications",
            icon: "/static/icons/basic/bell.svg#icon",
            priority: 80,
          },
        ],
      },
    },
    desktop: {
      main: [
        {
          id: "push-messages",
          title: "shared.layout.header.menu.push-messages",
          icon: "bell",
          priority: 40,
        },
      ],
      account: {
        children: [
          {
            id: "push-messages",
            title: "shared.account.navigation.links.notifications",
            route: {
              name: "Notifications",
            },
            icon: "bell",
            priority: 75,
          },
        ],
      },
    },
  },
};

const Notifications = defineAsyncComponent(() => import("@/modules/push-messages/pages/notifications.vue"));
const PushMessage = defineAsyncComponent(() => import("@/modules/push-messages/pages/push-message.vue"));

const menuLinkCustomElement: ElementType = {
  id: "push-messages",
  component: defineAsyncComponent(() => import("./components/link-push-messages.vue")),
};

const menuLinkCustomElementMobile: ElementType = {
  id: "push-messages",
  component: defineAsyncComponent(() => import("./components/link-push-messages-mobile.vue")),
};

async function unregisterFCM() {
  const serviceWorkerRegistration = await navigator.serviceWorker.getRegistration(REGISTRATION_SCOPE);
  if (serviceWorkerRegistration) {
    void serviceWorkerRegistration.unregister();
  }
}

const notificationsPlaceholderRoute: RouteRecordRaw = {
  path: "notifications",
  name: "Notifications",
  component: () => import("@/ui-kit/components/molecules/loader-overlay/vc-loader-overlay.vue"),
};

const pushMessagePlaceholderRoute: RouteRecordRaw = {
  path: "/push-message/:messageId",
  name: "PushMessage",
  component: () => import("@/ui-kit/components/molecules/loader-overlay/vc-loader-overlay.vue"),
};

export function usePushNotifications(router: Router) {
  router.addRoute("Account", notificationsPlaceholderRoute);
  router.addRoute(pushMessagePlaceholderRoute);

  async function init() {
    const { isEnabled } = useModuleSettings(MODULE_ID_PUSH_MESSAGES);
    const { isAuthenticated } = useUser();
    const { themeContext } = useThemeContext();
    const isModuleEnabled = isEnabled(PUSH_MESSAGES_MODULE_ENABLED_KEY);
    const isFCMModuleEnabled = isEnabled(PUSH_MESSAGES_MODULE_FCM_ENABLED_KEY);

    if (!themeContext.value?.settings?.push_messages_enabled) {
      void unregisterFCM();
      router.removeRoute("Notifications");
      router.removeRoute("PushMessage");
      return;
    }

    if (!isAuthenticated.value) {
      void unregisterFCM();
      router.removeRoute("Notifications");
      router.removeRoute("PushMessage");
      return;
    }

    if (isFCMModuleEnabled) {
      const { useWebPushNotificationsModule } = await import(
        "./composables/useWebPushNotifications/useWebPushNotificationsModule"
      );
      const { initModule } = useWebPushNotificationsModule();
      await initModule();
      const pushMessageRoute: RouteRecordRaw = {
        path: "/push-message/:messageId",
        name: "PushMessage",
        component: PushMessage,
        props: true,
      };
      router.addRoute(pushMessageRoute);
    } else {
      void unregisterFCM();
      router.removeRoute("PushMessage");
    }

    if (isModuleEnabled) {
      const { mergeMenuSchema } = useNavigations();
      const { registerCustomLinkComponent } = useCustomHeaderLinkComponents();
      const { registerCustomLinkComponent: registerCustomMobileLinkComponent } = useCustomMobileMenuLinkComponents();
      const notificationsRoute: RouteRecordRaw = {
        path: "notifications",
        name: "Notifications",
        component: Notifications,
        beforeEnter(_to, _from, next) {
          if (isAuthenticated.value) {
            next();
          } else {
            next({ name: "Dashboard" });
          }
        },
      };

      mergeMenuSchema(menuItems);
      registerCustomLinkComponent(menuLinkCustomElement);
      registerCustomMobileLinkComponent(menuLinkCustomElementMobile);
      router.addRoute("Account", notificationsRoute);
      if (router.currentRoute.value.name === "Notifications") {
        void router.replace(router.currentRoute.value);
      }
    } else {
      router.removeRoute("Notifications");
    }
  }

  return { init };
}
