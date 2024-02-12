import { computed, ref } from "vue";
import { getStore } from "@/core/api/graphql";
import { IS_DEVELOPMENT } from "../constants";
import { useFetch } from "./useFetch";
import type { IThemeConfig, IThemeConfigPreset, IThemeContext } from "../types";
const themeContext = ref<IThemeContext>();

export function useThemeContext() {
  const { innerFetch } = useFetch();

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
    if (IS_DEVELOPMENT) {
      const themeConfig = (await import("../../../config/settings_data.json")) as IThemeConfig;
      return typeof themeConfig.current === "string" ? themeConfig.presets[themeConfig.current] : themeConfig.current;
    } else {
      return await innerFetch<IThemeConfigPreset>("themes/settings.json");
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
  };
}
