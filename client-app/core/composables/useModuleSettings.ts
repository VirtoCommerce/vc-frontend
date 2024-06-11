import { createGlobalState } from "@vueuse/core";
import { computed } from "vue";
import { useThemeContext } from "@/core/composables";

function _useModuleSettings(moduleId: string) {
  const { themeContext } = useThemeContext();

  const modulesSettings = computed(() => {
    return themeContext.value?.storeSettings?.modules;
  });

  const moduleSettings = computed(() => {
    return themeContext.value?.storeSettings?.modules.find((obj) => obj.moduleId === moduleId)?.settings;
  });

  type SettingValueType = string | number | boolean | null;
  /**
   * Get normalized module settings
   * description: This function is used to get module settings and map them to the provided object.
   * params:
   * - settingsMapping: Record<string, string> - object with keys as settings names and values as keys for the result object. Example: { "Hotjar.EnableTracking": "isEnabled" } as const;
   */
  function getModuleSettings<T extends Record<string, string>>(
    settingsMapping: T,
  ): { [K in T[keyof T]]: SettingValueType } | null {
    if (!moduleSettings.value) {
      return null;
    }

    // Map settings based on the provided settingsMapping
    const result: Partial<{ [K in T[keyof T]]: SettingValueType }> = {};

    for (const setting of moduleSettings.value) {
      const mappedKey = settingsMapping[setting.name];
      if (mappedKey) {
        result[mappedKey as keyof typeof result] = setting.value ?? null;
      }
    }

    return result as { [K in T[keyof T]]: SettingValueType };
  }

  return {
    hasModuleSettings: computed(() => modulesSettings.value.some((obj) => obj.moduleId === moduleId) || false),
    getModuleSettings,
  };
}

export const useModuleSettings = createGlobalState(_useModuleSettings);
