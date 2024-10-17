import { createGlobalState } from "@vueuse/core";
import { computed, ref } from "vue";
import settingsData from "@/config/settings_data.json";
import { useFetch } from "@/core/api/common";
import { IS_DEVELOPMENT } from "../constants";
import type { StoreResponseType } from "../api/graphql/types";
import type { IThemeConfig, IThemeContext, IThemeConfigPreset } from "../types";

function _useThemeContext() {
  const themeContext = ref<IThemeContext>();

  async function fetchThemeContext(store: StoreResponseType, themePresetName?: string) {
    const themeConfig = fetchThemeConfig();

    if (!themeConfig) {
      throw new Error("Can't get theme context");
    }

    const defaultThemePreset = themeContext.value?.preset;
    const themePreset = await fetchThemePreset(themeConfig, themePresetName);

    themeContext.value = {
      ...store,
      settings: themeConfig.settings,
      preset: themePreset ?? defaultThemePreset,
      storeSettings: store.settings,
    };
  }

  async function fetchThemePreset(themeConfig: IThemeConfig, themePresetName?: string): Promise<IThemeConfigPreset> {
    const preset = themePresetName ?? themeConfig.current;

    if (typeof preset === "string") {
      const presetFileName = preset.toLowerCase().replace(" ", "-");

      const { data } = await useFetch(`/config/presets/${presetFileName}.json`).get().json<IThemeConfigPreset>();

      return data.value!;
    }

    return preset;
  }

  function fetchThemeConfig() {
    const data = settingsData as IThemeConfig;

    if (IS_DEVELOPMENT && data) {
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
