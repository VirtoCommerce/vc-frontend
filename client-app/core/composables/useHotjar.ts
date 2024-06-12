import { canUseDOM } from "@apollo/client/utilities";
import Hotjar from "@hotjar/browser";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities";
import { useUser } from "@/shared/account/composables/useUser";

const { modulesSettings } = useThemeContext();

const DEBUG_PREFIX = "[Hotjar]";

const MODULE_KEYS = {
  ID: "VirtoCommerce.Hotjar",
  ENABLE_STATE: "Hotjar.EnableTracking",
  TRACK_ID: "Hotjar.SiteId",
  SNIPPET_VERSION: "Hotjar.SnippetVersion",
};

function init() {
  if (!canUseDOM) {
    return;
  }
  const moduleSettings = modulesSettings?.value?.find((el) => el.moduleId === MODULE_KEYS.ID);

  const [isEnabled, id, version] = [
    !!getSettingsValue(moduleSettings?.settings, MODULE_KEYS.ENABLE_STATE),
    Number(getSettingsValue(moduleSettings?.settings, MODULE_KEYS.TRACK_ID)),
    Number(getSettingsValue(moduleSettings?.settings, MODULE_KEYS.SNIPPET_VERSION)),
  ];

  if (isEnabled && id && version) {
    if (!IS_DEVELOPMENT) {
      Hotjar.init(id, version);
      const { user } = useUser();
      Hotjar.identify(user.value?.id, {});
    } else {
      Logger.debug(DEBUG_PREFIX, "Hotjar enabled but not initialized");
    }
  }
}

function getSettingsValue(settings: { name: string; value?: unknown }[] | undefined, settingsKey: string): unknown {
  return settings?.find((el) => el.name === settingsKey)?.value;
}

export function useHotjar() {
  return {
    init,
  };
}
