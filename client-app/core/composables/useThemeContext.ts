import { computed, ref } from "vue";
import { getStoreSettings } from "@/core/api/graphql/settings";
import type { IThemeConfig, IThemeContext } from "../types";

const themeContext = ref<IThemeContext>();

export function useThemeContext() {
  async function fetchThemeContext() {
    const data = await getStoreSettings("B2B-store");
    if (!data) {
      return;
    }

    const allSettings = (await import("../../../config/settings_data.json")) as IThemeConfig;

    const settings =
      typeof allSettings.current === "string" ? allSettings.presets[allSettings.current] : allSettings.current;

    themeContext.value = {
      ...data,
      settings,
      settingsFromPlatform: data.settings,
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
