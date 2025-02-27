import { createGlobalState } from "@vueuse/core";
import cloneDeep from "lodash/cloneDeep";
import { computed, ref } from "vue";
import settingsData from "@/config/settings_data.json";
import { Logger } from "@/core/utilities";
import { IS_DEVELOPMENT } from "../constants";
import type { StoreResponseType } from "../api/graphql/types";
import type { IThemeConfig, IThemeConfigPreset, IThemeContext } from "../types";

function _useThemeContext() {
  const themeContext = ref<IThemeContext>();

  async function fetchPreset(themePresetName?: string): Promise<void> {
    const themeConfig = getThemeConfig();

    if (themeContext.value && themePresetName) {
      const presetFileName = themePresetName.toLowerCase().replace(" ", "-");

      let preset: IThemeConfigPreset | null = null;
      try {
        const module = (await import(`@/assets/presets/${presetFileName}.json`)) as {
          default: IThemeConfigPreset;
        };
        preset = module.default;
      } catch (e) {
        Logger.error(fetchPreset.name, e);
      }

      if(!preset) {
        try {
          // try to get default preset
          const module = (await import(`@/assets/presets/${themeConfig.current}.json`)) as {
            default: IThemeConfigPreset;
          };
          preset = module.default;
        } catch (e) {
          Logger.error(fetchPreset.name, e);
        }
      }

      if (preset) {
        themeContext.value.preset = preset;
      } else {
        throw new Error("Missing preset");
      }
    }
  }

  function getThemeConfig() {
    const data = cloneDeep(settingsData) as IThemeConfig;

    if (IS_DEVELOPMENT && typeof data.settings === "object" && data.settings !== null) {
      data.settings.details_browser_target = "_self";
    }

    return data;
  }

  function setGlobalState(store: StoreResponseType) {
    const themeConfig = getThemeConfig();

    if (!themeConfig) {
      throw new Error("Can't get theme context");
    }

    themeContext.value = {
      ...store,
      settings: themeConfig.settings,
      storeSettings: store.settings,
    };
  }

  return {
    setGlobalState,
    fetchPreset,
    themeContext: computed({
      get() {
        if (!themeContext.value) {
          throw new Error("Theme context is missing.");
        }

        return themeContext.value;
      },

      set() {
        throw new Error("Theme context change is not available.");
      },
    }),
    modulesSettings: computed(() => {
      return themeContext.value?.storeSettings?.modules;
    }),
  };
}

export const useThemeContext = createGlobalState(_useThemeContext);
