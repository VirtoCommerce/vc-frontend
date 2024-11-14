import { defineAsyncComponent } from "vue";
import { cache } from "@/core/api/graphql/config";
import { useNavigations } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { MODULE_ID_PUSH_MESSAGES } from "@/core/constants/modules";
import { useUser } from "@/shared/account/composables/useUser";
import { useCustomHeaderLinkComponents } from "@/shared/layout/composables/useCustomHeaderLinkComponents";
import { useCustomMobileMenuLinkComponents } from "@/shared/layout/composables/useCustomMobileMenuLinkComponents";
import { pushMessagesTypePolices } from "./api/graphql/typePolices";
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

export function usePushNotifications() {
  async function init(router: Router) {
    const { isEnabled } = useModuleSettings(MODULE_ID_PUSH_MESSAGES);
    const { isAuthenticated } = useUser();
    const { themeContext } = useThemeContext();
    const isModuleEnabled = isEnabled(PUSH_MESSAGES_MODULE_ENABLED_KEY);
    const isFCMModuleEnabled = isEnabled(PUSH_MESSAGES_MODULE_FCM_ENABLED_KEY);

    if (!themeContext.value?.settings?.push_messages_enabled || !isAuthenticated.value) {
      void unregisterFCM();
      return;
    }

    if (isModuleEnabled) {
      const { mergeMenuSchema } = useNavigations();
      const { registerCustomLinkComponent } = useCustomHeaderLinkComponents();
      const { registerCustomLinkComponent: registerCustomMobileLinkComponent } = useCustomMobileMenuLinkComponents();
      const route: RouteRecordRaw = {
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

      cache.policies.addTypePolicies(pushMessagesTypePolices);
      mergeMenuSchema(menuItems);
      registerCustomLinkComponent(menuLinkCustomElement);
      registerCustomMobileLinkComponent(menuLinkCustomElementMobile);
      router.addRoute("Account", route); // NOTE: This route must be added before any asynchronous calls. Delaying it can cause a 404 error if accessed prematurely.
    }

    if (isFCMModuleEnabled) {
      const route: RouteRecordRaw = {
        path: "/push-message/:messageId",
        name: "PushMessage",
        component: PushMessage,
        props: true,
      };
      router.addRoute(route); // NOTE: This route must be added before any asynchronous calls. Delaying it can cause a 404 error if accessed prematurely.

      const { useWebPushNotificationsModule } = await import(
        "./composables/useWebPushNotifications/useWebPushNotificationsModule"
      );
      const { initModule } = useWebPushNotificationsModule();
      await initModule();
    } else {
      void unregisterFCM();
    }
  }

  return { init };
}
