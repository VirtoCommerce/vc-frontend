import { createGlobalState } from "@vueuse/core";
import cloneDeep from "lodash/cloneDeep";
import { computed, ref } from "vue";
import settingsData from "@/config/settings_data.json";
import { IS_DEVELOPMENT } from "../constants";
import type { StoreResponseType } from "../api/graphql/types";
import type { IThemeConfig, IThemeContext, IThemeConfigPreset } from "../types";

function _useThemeContext() {
  const themeContext = ref<IThemeContext>();

  async function fetchThemeContext(store: StoreResponseType, themePresetName?: string) {
    const themeConfig = getThemeConfig();

    if (!themeConfig) {
      throw new Error("Can't get theme context");
    }

    const themePreset = await fetchThemePreset(themeConfig, themePresetName);

    themeContext.value = {
      ...store,
      settings: themeConfig.settings,
      preset: themePreset,
      storeSettings: store.settings,
    };
  }

  async function fetchThemePreset(themeConfig: IThemeConfig, themePresetName?: string): Promise<IThemeConfigPreset> {
    const preset = themePresetName ?? themeConfig.current;
    const defaultThemePreset = themeContext.value?.preset;

    if (typeof preset === "string") {
      const presetFileName = preset.toLowerCase().replace(" ", "-");

      try {
        const module = (await import(`@/assets/presets/${presetFileName}.json`)) as {
          default: IThemeConfigPreset;
        };

        return module?.default;
      } catch {
        if (defaultThemePreset) {
          return defaultThemePreset;
        }
      }
    }

    return preset as IThemeConfigPreset;
  }

  function getThemeConfig() {
    const data = cloneDeep(settingsData) as IThemeConfig;

    if (IS_DEVELOPMENT && typeof data.settings === "object" && data.settings !== null) {
      data.settings.details_browser_target = "_self";
    }

    return data;
  }

  return {
    fetchThemeContext,
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
