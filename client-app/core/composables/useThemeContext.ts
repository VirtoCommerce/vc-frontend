import { createGlobalState } from "@vueuse/core";
import { computed, ref } from "vue";
import { useFetch } from "@/core/api/common";
import { IS_DEVELOPMENT } from "../constants";
import type { StoreResponseType } from "../api/graphql/types";
import type { IThemeConfig, IThemeContext, IThemeConfigPreset } from "../types";

function _useThemeContext() {
  const themeContext = ref<IThemeContext>();
  const modulesSettings = computed(() => {
    return themeContext.value?.storeSettings?.modules;
  });

  async function fetchThemeContext(store: StoreResponseType, themePresetName?: string) {
    const themeSettings = await fetchThemeSettings(store.storeId, themePresetName);

    if (!themeSettings) {
      throw new Error("Can't get theme context");
    }

    themeContext.value = {
      ...store,
      settings: themeSettings,
      storeSettings: store.settings,
    };
  }

  function getThemePreset(themeConfig: IThemeConfig, themePresetName?: string): IThemeConfigPreset {
    if (themePresetName && themeConfig.presets[themePresetName]) {
      return themeConfig.presets[themePresetName];
    }

    return typeof themeConfig.current === "string" ? themeConfig.presets[themeConfig.current] : themeConfig.current;
  }

  async function fetchThemeSettings(storeId: string, themePresetName?: string) {
    if (IS_DEVELOPMENT) {
      const themeConfig = (await import("../../../config/settings_data.json")) as IThemeConfig;

      return getThemePreset(themeConfig, themePresetName);
    } else {
      const { data } = await useFetch(`/cms-content/Themes/${storeId}/default/config/settings_data.json`)
        .get()
        .json<IThemeConfig>();

      return getThemePreset(data.value!, themePresetName);
    }
  }

  type SettingValueType = string | number | boolean | null;
  /**
   * Get normalized module settings by moduleId
   * description: This function is used to get module settings by moduleId and map them to the provided object.
   * params:
   * - moduleId: string
   * - settingsMapping: Record<string, string> - object with keys as settings names and values as keys for the result object. Example: { "Hotjar.EnableTracking": "isEnabled" } as const;
   */
  function getModuleSettings<T extends Record<string, string>>(
    moduleId: string,
    settingsMapping: T,
  ): { [K in T[keyof T]]: SettingValueType } | null {
    const settingsObj = modulesSettings.value?.find((obj) => obj.moduleId === moduleId);

    if (!settingsObj) {
      return null;
    }

    // Map settings based on the provided settingsMapping
    const result: Partial<{ [K in T[keyof T]]: SettingValueType }> = {};

    for (const setting of settingsObj.settings) {
      const mappedKey = settingsMapping[setting.name];
      if (mappedKey) {
        result[mappedKey as keyof typeof result] = setting.value ?? null;
      }
    }

    return result as { [K in T[keyof T]]: SettingValueType };
  }

  function hasModuleSettings(moduleId: string): boolean {
    return themeContext.value?.storeSettings?.modules?.some((obj) => obj.moduleId === moduleId) || false;
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
    modulesSettings,
    hasModuleSettings,
    getModuleSettings,
  };
}

export const useThemeContext = createGlobalState(_useThemeContext);
