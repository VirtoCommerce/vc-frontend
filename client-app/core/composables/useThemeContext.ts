import { createGlobalState } from "@vueuse/core";
import { computed, ref } from "vue";
import { useFetch } from "@/core/api/common";
import { IS_DEVELOPMENT } from "../constants";
import type { StoreResponseType } from "../api/graphql/types";
import type { IThemeConfig, IThemeContext, IThemeConfigPreset } from "../types";

function _useThemeContext() {
  const themeContext = ref<IThemeContext>();

  async function fetchThemeContext(store: StoreResponseType, themePresetName?: string) {
    const themeConfig = await fetchThemeConfig();

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

  async function fetchThemeConfig() {
    const { data } = await useFetch("/config/settings_data.json").get().json<IThemeConfig>();

    if (IS_DEVELOPMENT && data.value) {
      data.value.settings.show_details_in_separate_tab = false;
    }

    return data.value;
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
