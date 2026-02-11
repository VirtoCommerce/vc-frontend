import { defineAsyncComponent } from "vue";
import { cache } from "@/core/api/graphql/config";
import { useNavigations } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { MODULE_ID_PUSH_MESSAGES } from "@/core/constants/modules";
import { loadModuleLocale } from "@/modules/utils";
import { ROUTES } from "@/router/routes/constants";
import { useUser } from "@/shared/account/composables/useUser";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { pushMessagesTypePolices } from "./api/graphql/typePolices";
import { PUSH_MESSAGES_MODULE_ENABLED_KEY, PUSH_MESSAGES_MODULE_FCM_ENABLED_KEY } from "./constants";
import type { MenuType } from "@/core/types";
import type { I18n } from "@/i18n";
import type { DeepPartial } from "utility-types";
import type { Router, RouteRecordRaw } from "vue-router";

const REGISTRATION_SCOPE = "/firebase-cloud-messaging-push-scope";

const menuItems: DeepPartial<MenuType> = {
  header: {
    mobile: {
      marketing: {
        children: [
          {
            id: "push-messages",
            route: {
              name: "Notifications",
            },
            title: "push_messages.menu_item_name",
            icon: "notification",
            priority: 10,
          },
        ],
      },
    },
    desktop: {
      main: [
        {
          id: "push-messages",
          title: "push_messages.menu_item_name",
          icon: "notification-v2",
          priority: 40,
        },
      ],
      marketing: {
        children: [
          {
            id: "push-messages",
            title: "push_messages.menu_item_name",
            route: {
              name: "Notifications",
            },
            icon: "notification",
            priority: 10,
          },
        ],
      },
    },
  },
};

const Notifications = () => import("@/modules/push-messages/pages/notifications.vue");
const PushMessage = () => import("@/modules/push-messages/pages/push-message.vue");

const menuLinkCustomElement = {
  id: "push-messages",
  component: defineAsyncComponent(() => import("./components/link-push-messages.vue")),
};

const menuLinkCustomElementMobile = {
  id: "push-messages",
  component: defineAsyncComponent(() => import("./components/link-push-messages-mobile.vue")),
};

const headerWidgetCustomElementMobile = {
  id: "push-messages",
  component: defineAsyncComponent(() => import("./components/push-messages-mobile.vue")),
};

async function unregisterFCM() {
  const serviceWorkerRegistration = await navigator.serviceWorker.getRegistration(REGISTRATION_SCOPE);
  if (serviceWorkerRegistration) {
    void serviceWorkerRegistration.unregister();
  }
}

export async function init(router: Router, i18n: I18n) {
  const { isEnabled } = useModuleSettings(MODULE_ID_PUSH_MESSAGES);
  const { isAuthenticated } = useUser();
  const { themeContext } = useThemeContext();
  const isModuleEnabled = isEnabled(PUSH_MESSAGES_MODULE_ENABLED_KEY);
  const isFCMModuleEnabled = isEnabled(PUSH_MESSAGES_MODULE_FCM_ENABLED_KEY);

  if (!themeContext.value?.settings?.push_messages_enabled || !isAuthenticated.value) {
    router.addRoute("Account", {
      path: "notifications",
      redirect: { name: ROUTES.SIGN_IN.NAME },
    });

    void unregisterFCM();
    return;
  }

  if (isModuleEnabled) {
    const { mergeMenuSchema } = useNavigations();
    const { register } = useExtensionRegistry();
    const route: RouteRecordRaw = {
      path: "notifications",
      name: "Notifications",
      component: Notifications,
    };

    cache.policies.addTypePolicies(pushMessagesTypePolices);
    mergeMenuSchema(menuItems);
    void loadModuleLocale(i18n, "push-messages");

    register("headerMenu", "push-messages", {
      component: menuLinkCustomElement.component,
    });
    register("mobileMenu", "push-messages", {
      component: menuLinkCustomElementMobile.component,
    });
    register("mobileHeader", "push-messages", {
      component: headerWidgetCustomElementMobile.component,
    });

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

    const { useWebPushNotificationsModule } =
      await import("./composables/useWebPushNotifications/useWebPushNotificationsModule");
    const { initModule } = useWebPushNotificationsModule();
    await initModule();
  } else {
    void unregisterFCM();
  }
}
