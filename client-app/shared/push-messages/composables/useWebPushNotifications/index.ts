import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useUser } from "@/shared/account/composables/useUser";

const MODULE_ID = "VirtoCommerce.PushMessages";
const REGISTRATION_SCOPE = "/firebase-cloud-messaging-push-scope";

export function useWebPushNotifications() {
  async function init() {
    const { hasModuleSettings } = useModuleSettings(MODULE_ID);
    const { isAuthenticated } = useUser();

    if (isAuthenticated.value === false || !hasModuleSettings.value) {
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
