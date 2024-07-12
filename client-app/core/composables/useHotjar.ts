import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities";
import { useUser } from "@/shared/account/composables/useUser";

const MODULE_ID = "VirtoCommerce.Hotjar";
const IS_ENABLED_KEY = "Hotjar.EnableTracking";

const { getModuleSettings, hasModuleSettings, isEnabled } = useModuleSettings(MODULE_ID);

export function useHotjar() {
  async function init(): Promise<void> {
    if (!hasModuleSettings && !isEnabled(IS_ENABLED_KEY)) {
      useModuleSettings.delete(MODULE_ID);
      return;
    }
    try {
      const { user } = useUser();
      const { useHotjarModule } = await import("@virto-commerce/front-modules-hotjar");
      const { initModule } = useHotjarModule();

      initModule({
        getModuleSettings,
        isDevelopment: IS_DEVELOPMENT,
        logger: Logger,
        userId: user.value.id,
      });
    } catch (e) {
      Logger.error(useHotjar.name, e);
    }
  }

  return {
    init,
  };
}
