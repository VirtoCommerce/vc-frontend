import { computed, ref } from "vue";
import { getStoreSettings } from "@/core/api/graphql/settings";
import type { IThemeConfig, IThemeConfigPreset, IThemeContext } from "../types";
import type { GetStoreSettingsQuery } from "@/core/api/graphql/types";

const themeContext = ref<IThemeContext>();

export function useThemeContext() {
  function fetchThemeContext() {
    let data: GetStoreSettingsQuery["store"];
    let settings: IThemeConfigPreset;

    const context = getStoreSettings("B2B-store").then((res) => {
      data = res;
    });
    const config = import("../../../config/settings_data.json").then((res) => {
      const allSettings = res as IThemeConfig;
      settings =
        typeof allSettings.current === "string" ? allSettings.presets[allSettings.current] : allSettings.current;
    });

    return Promise.all([config, context]).then(() => {
      if (!data) {
        return;
      }
      themeContext.value = {
        ...data,
        settings,
        settingsFromPlatform: data.settings,
      };
    });
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
