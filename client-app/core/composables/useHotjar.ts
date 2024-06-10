import { useModule } from "@/core/composables/useModule";
import { Logger } from "@/core/utilities";

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

const { getModuleSettings, hasModuleSettings, isEnabled } = useModule(MODULE_ID);

export async function useHotjar() {
  if (hasModuleSettings && isEnabled) {
    try {
      const { useHotjar: useIt } = await import("vc-module-front-hotjar");
      const { init } = useIt();
      const { canUseDOM } = await import("@apollo/client/utilities");

      init({
        settings: { ...(getModuleSettings(HOTJAR_SETTINGS_MAPPING) as HotjarSettingsType) },
        dependencies: {
          canUseDOM,
          isDevelopment: false,
          logger: Logger,
          userId: user.value.id,
        },
      });
    } catch (e) {
      Logger.error("Hotjar module initialization", e);
    }
  }
}
