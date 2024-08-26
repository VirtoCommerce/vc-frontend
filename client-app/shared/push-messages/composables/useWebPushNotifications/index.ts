import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { MODULE_ID_PUSH_MESSAGES } from "@/core/constants/modules";
import { useUser } from "@/shared/account/composables/useUser";

const REGISTRATION_SCOPE = "/firebase-cloud-messaging-push-scope";

export function useWebPushNotifications() {
  async function init() {
    const { hasModuleSettings } = useModuleSettings(MODULE_ID_PUSH_MESSAGES);
    const { isAuthenticated } = useUser();
    const { themeContext } = useThemeContext();

    if (
      !themeContext.value?.settings?.push_messages_enabled ||
      isAuthenticated.value === false ||
      !hasModuleSettings.value
    ) {
      const serviceWorkerRegistration = await navigator.serviceWorker.getRegistration(REGISTRATION_SCOPE);
      if (serviceWorkerRegistration) {
        void serviceWorkerRegistration.unregister();
      }
      return;
    }

    const { useWebPushNotificationsModule } = await import("./useWebPushNotificationsModule");
    const { initModule } = useWebPushNotificationsModule();
    await initModule();
  }

  return { init };
}
