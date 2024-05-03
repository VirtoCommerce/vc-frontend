import { createGlobalState } from "@vueuse/core";
import { computed, ref } from "vue";
import { useFetch } from "@/core/api/common";
import { getStore } from "@/core/api/graphql";
import { IS_DEVELOPMENT } from "../constants";
import type { IThemeConfig, IThemeContext, IThemeConfigPreset } from "../types";

function _useThemeContext() {
  const STORE_ID = "B2B-store";

  const themeContext = ref<IThemeContext>();

  async function fetchThemeContext(themePresetName?: string) {
    const store = await getStore(STORE_ID);

    if (!store) {
      throw new Error("Can't get store");
    }

    const themeSettings = await fetchThemeSettings(themePresetName);

    if (!themeSettings) {
      throw new Error("Can't get theme context");
    }

    themeContext.value = {
      ...store,
      settings: themeSettings,
      storeSettings: store.settings,
    };
  }

  function getThemePreset(themeConfig: IThemeConfig, themePresetName?: string): IThemeConfigPreset {
    if (themePresetName && themeConfig.presets[themePresetName]) {
      return themeConfig.presets[themePresetName];
    }

    return typeof themeConfig.current === "string" ? themeConfig.presets[themeConfig.current] : themeConfig.current;
  }

  async function fetchThemeSettings(themePresetName?: string) {
    if (IS_DEVELOPMENT) {
      const themeConfig = (await import("../../../config/settings_data.json")) as IThemeConfig;

      return getThemePreset(themeConfig, themePresetName);
    } else {
      const { data } = await useFetch(`/cms-content/Themes/${STORE_ID}/default/config/settings_data.json`)
        .get()
        .json<IThemeConfig>();

      return getThemePreset(data.value!, themePresetName);
    }
  }

  return {
    fetchThemeContext,
    themeContext: computed({
      get() {
        if (!themeContext.value) {
          throw new Error("Theme context is missing.");
        }

        return themeContext.value!;
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
