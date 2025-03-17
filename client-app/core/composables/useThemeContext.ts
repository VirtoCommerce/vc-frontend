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

  function setThemeContext(store: StoreResponseType) {
    const themeConfig = getThemeConfig();

    if (!themeConfig) {
      throw new Error("Can't get theme context");
    }

    themeContext.value = {
      ...store,
      settings: themeConfig.settings,
      storeSettings: store.settings,
      defaultPresetName: themeConfig.current,
    };
  }

  async function addPresetToThemeContext(presetName: string): Promise<void> {
    if (!themeContext.value) {
      throw new Error("The global state should be defined");
    }

    let preset = await fetchPreset(presetNameToFileName(presetName));

    if (!preset) {
      const defaultPresetName = getThemeConfig().current;
      preset = await fetchPreset(presetNameToFileName(defaultPresetName));
    }

    if (preset) {
      themeContext.value.preset = preset;
    } else {
      throw new Error("Missing preset");
    }
  }

  function getThemeConfig() {
    const data = cloneDeep(settingsData) as IThemeConfig;

    if (IS_DEVELOPMENT && typeof data.settings === "object" && data.settings !== null) {
      data.settings.details_browser_target = "_self";
    }

    return data;
  }

  async function fetchPreset(themePresetName: string): Promise<IThemeConfigPreset | void> {
    try {
      const module = (await import(`client-app/assets/presets/${themePresetName}.json`)) as {
        default: IThemeConfigPreset;
      };
      return module.default;
    } catch (e) {
      Logger.error(fetchPreset.name, e);
    }
  }

  function presetNameToFileName(name: string): string {
    return name.toLowerCase().replace(" ", "-");
  }

  return {
    setThemeContext,
    addPresetToThemeContext,
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
