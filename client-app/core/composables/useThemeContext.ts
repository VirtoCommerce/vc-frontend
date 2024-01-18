import { computed, ref } from "vue";
import { getStoreSettings } from "@/core/api/graphql/settings";
import type { IThemeConfig, IThemeContext } from "../types";
const themeContext = ref<IThemeContext>();

export function useThemeContext() {
  async function fetchThemeContext() {
    const [storeSettings, themeSettings] = await Promise.all([
      getStoreSettings("B2B-store"),
      import("../../../config/settings_data.json") as Promise<IThemeConfig>,
    ]);

    if (!storeSettings || !themeSettings) {
      return;
    }

    const themeConfig =
      typeof themeSettings.current === "string" ? themeSettings.presets[themeSettings.current] : themeSettings.current;

    themeContext.value = {
      ...storeSettings,
      settings: themeConfig,
      settingsFromPlatform: storeSettings.settings,
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
