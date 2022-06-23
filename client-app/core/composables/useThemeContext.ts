import { computed, ref } from "vue";
import { DEVELOPMENT } from "@/core/constants";
import { IThemeConfig, IThemeContext } from "@/core/types";

const themeContext = ref<IThemeContext>();

export default function useThemeContext() {
  async function fetchThemeContext() {
    const result: IThemeContext = await (await fetch("/storefrontapi/theme/context")).json();

    if (DEVELOPMENT) {
      // TODO: remove this when switching to SSR
      const settings: IThemeConfig = await import("../../../config/settings_data.json");
      if (typeof settings.current === "string") {
        result.settings = settings.presets[settings.current];
      }
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
