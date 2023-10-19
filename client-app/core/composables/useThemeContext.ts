import { computed, ref } from "vue";
import { IS_DEVELOPMENT } from "../constants";
import type { IThemeConfig, IThemeContext } from "../types";

const themeContext = ref<IThemeContext>();

export function useThemeContext() {
  async function fetchThemeContext() {
    const result: IThemeContext = await (await fetch("/storefrontapi/theme/context")).json();

    if (IS_DEVELOPMENT) {
      // TODO: remove this when switching to SSR
      const settings = (await import("../../../config/settings_data.json")) as IThemeConfig;

      result.settings = typeof settings.current === "string" ? settings.presets[settings.current] : settings.current;
    }

    themeContext.value = result;
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
