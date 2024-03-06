import { createGlobalState } from "@vueuse/core";
import { computed, ref } from "vue";
import { useFetch } from "@/core/api/common";
import { getStore } from "@/core/api/graphql";
import type { IThemeConfig, IThemeContext } from "../types";

function _useThemeContext() {
  const themeContext = ref<IThemeContext>();

  async function fetchThemeContext() {
    const [store, themeSettings] = await Promise.all([getStore("B2B-store"), fetchThemeSettings()]);

    if (!store || !themeSettings) {
      throw new Error("Can't get context");
    }

    themeContext.value = {
      ...store,
      settings: themeSettings,
      storeSettings: store.settings,
    };
  }

  async function fetchThemeSettings() {
    const { data } = await useFetch("/config/settings_data.json").get().json();
    const themeConfig = data.value as IThemeConfig;
    return typeof themeConfig.current === "string" ? themeConfig.presets[themeConfig.current] : themeConfig.current;
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
  };
}

export const useThemeContext = createGlobalState(_useThemeContext);
