import { createGlobalState } from "@vueuse/core";
import { computed } from "vue";
import { useThemeContext } from "@/core/composables";

function _useModule(moduleId: string) {
  const { themeContext } = useThemeContext();

  const modulesSettings = computed(() => {
    return themeContext.value?.storeSettings?.modules;
  });

  const moduleSettings = computed(() => {
    return themeContext.value?.storeSettings?.modules.find((obj) => obj.moduleId === moduleId)?.settings ?? [];
  });

  const isEnabled = computed(() => moduleSettings.value.find((prop) => prop.name === "isEnabled")?.value ?? false);

  type SettingValueType = string | number | boolean | null;
  /**
   * Get normalized module settings by moduleId
   * description: This function is used to get module settings by moduleId and map them to the provided object.
   * params:
   * - moduleId: string
   * - settingsMapping: Record<string, string> - object with keys as settings names and values as keys for the result object. Example: { "Hotjar.EnableTracking": "isEnabled" } as const;
   */
  function getModuleSettings<T extends Record<string, string>>(
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

  return {
    hasModuleSettings: computed(() => modulesSettings.value.some((obj) => obj.moduleId === moduleId) || false),
    getModuleSettings,
    isEnabled,
  };
}

export const useModule = createGlobalState(_useModule);
