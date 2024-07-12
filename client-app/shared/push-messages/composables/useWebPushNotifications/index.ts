import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useUser } from "@/shared/account/composables/useUser";

const MODULE_ID = "VirtoCommerce.PushMessages";

export function useWebPushNotifications() {
  async function init() {
    const { hasModuleSettings } = useModuleSettings(MODULE_ID);
    const { isAuthenticated } = useUser();

    if (isAuthenticated.value === false || !hasModuleSettings.value) {
      useModuleSettings.delete(MODULE_ID);
      return;
    }

    const { useWebPushNotificationsModule } = await import("./useWebPushNotificationsModule");
    await useWebPushNotificationsModule().initModule();
  }

  return { init };
}
