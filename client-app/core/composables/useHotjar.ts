import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities";
import { useUser } from "@/shared/account";

const MODULE_ID = "VirtoCommerce.Hotjar";

const HOTJAR_SETTINGS_MAPPING = {
  "Hotjar.EnableTracking": "isEnabled",
  "Hotjar.SiteId": "id",
  "Hotjar.SnippetVersion": "version",
} as const;

type HotjarSettingsType = {
  isEnabled: boolean;
  id: string;
  version: string;
};

const { getModuleSettings, hasModuleSettings } = useModuleSettings(MODULE_ID);

export function useHotjar() {
  async function init(): Promise<void> {
    if (hasModuleSettings) {
      try {
        const settings = getModuleSettings(HOTJAR_SETTINGS_MAPPING) as HotjarSettingsType;
        if (!settings.isEnabled) {
          return;
        }
        const { user } = useUser();
        const { useHotjarModule } = await import("vc-module-front-hotjar");
        const { initModule } = useHotjarModule();
        const { canUseDOM } = await import("@apollo/client/utilities");

        initModule({
          settings,
          dependencies: {
            canUseDOM,
            isDevelopment: IS_DEVELOPMENT,
            logger: Logger,
            userId: user.value.id,
          },
        });
      } catch (e) {
        Logger.error(useHotjar.name, e);
      }
    }
  }

  return {
    init,
  };
}
