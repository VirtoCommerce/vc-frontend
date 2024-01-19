import { computed, ref } from "vue";
import { getStore } from "@/core/api/graphql/settings";
import type { IThemeConfig, IThemeContext } from "../types";
const themeContext = ref<IThemeContext>();

export function useThemeContext() {
  async function fetchThemeContext() {
    const [store, themeSettings] = await Promise.all([
      getStore("B2B-store"),
      import("../../../config/settings_data.json") as Promise<IThemeConfig>,
    ]);

    if (!store || !themeSettings) {
      throw new Error("Can't get context");
    }

    const themeConfig =
      typeof themeSettings.current === "string" ? themeSettings.presets[themeSettings.current] : themeSettings.current;

    themeContext.value = {
      ...store,
      settings: themeConfig,
      settingsFromPlatform: store.settings,
    };
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
