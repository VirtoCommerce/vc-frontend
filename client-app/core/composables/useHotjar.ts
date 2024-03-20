import { canUseDOM } from "@apollo/client/utilities";
import Hotjar from "@hotjar/browser";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities";

const { modulesSettings } = useThemeContext();

const DEBUG_PREFIX = "[Hotjar]";

const MODULE_KEYS = {
  ID: "VirtoCommerce.Hotjar",
  ENABLE_STATE: "Hotjar.EnableTracking",
  TRACK_ID: "Hotjar.SiteId",
};

function init() {
  if (!canUseDOM) {
    return;
  }
  const moduleSettings = modulesSettings.value?.find((el) => el.moduleId === MODULE_KEYS.ID);
  const isEnabled = !!moduleSettings?.settings?.find((el) => el.name === MODULE_KEYS.ENABLE_STATE)?.value;

  if (isEnabled) {
    const id = moduleSettings?.settings?.find((el) => el.name === MODULE_KEYS.TRACK_ID)?.value as number;
    if (!IS_DEVELOPMENT) {
      // todo get version from Platform
      Hotjar.init(id, 6);
    } else {
      Logger.debug(DEBUG_PREFIX, "Hotjar enabled but not initialized");
    }
  }
}

export function useHotjar() {
  return {
    init,
  };
}
