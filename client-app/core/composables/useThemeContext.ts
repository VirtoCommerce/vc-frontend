import { IThemeConfig, IThemeContext } from "@core/types";
import { computed, ref } from "vue";

const themeContext = ref<IThemeContext>();

export default function useThemeContext() {
  async function fetchThemeContext() {
    const result: IThemeContext = await (await fetch("/storefrontapi/theme/context")).json();

    if (import.meta.env.MODE === "development") {
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
    themeContext: computed(() => themeContext.value),
  };
}
