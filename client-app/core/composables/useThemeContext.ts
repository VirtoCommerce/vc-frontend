import { createGlobalState } from "@vueuse/core";
import { computed, ref } from "vue";
import { useFetch } from "@/core/api/common";
import { getStore } from "@/core/api/graphql";
import { IS_DEVELOPMENT } from "../constants";
import type { IThemeConfig, IThemeConfigPreset, IThemeContext } from "../types";

function _useThemeContext() {
  const themeContext = ref<IThemeContext>();

  async function fetchThemeContext(themePresetName?: string) {
    const [store, themeSettings] = await Promise.all([getStore("B2B-store"), fetchThemeSettings(themePresetName)]);

    if (!store || !themeSettings) {
      throw new Error("Can't get context");
    }

    themeContext.value = {
      ...store,
      settings: themeSettings,
      storeSettings: store.settings,
    };
  }

  async function fetchThemeSettings(themePresetName?: string) {
    if (IS_DEVELOPMENT) {
      const themeConfig = (await import("../../../config/settings_data.json")) as IThemeConfig;

      if (themePresetName && themeConfig.presets[themePresetName]) {
        return themeConfig.presets[themePresetName];
      }

      return typeof themeConfig.current === "string" ? themeConfig.presets[themeConfig.current] : themeConfig.current;
    } else {
      // TODO: Refactor after storefront dead
      const { data } = await useFetch("/themes/settings.json").get().json<IThemeConfigPreset>();
      return data.value!;
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
