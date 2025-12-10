import { createGlobalState } from "@vueuse/core";
import cloneDeep from "lodash/cloneDeep";
import { computed, ref } from "vue";
import { presets } from "@/assets/presets";
import settingsData from "@/config/settings_data.json";
import { IS_DEVELOPMENT } from "../constants";
import { BrowserTargetType } from "../enums";
import type { StoreResponseType } from "../api/graphql/types";
import type { IThemeConfig, IThemeConfigPreset, IThemeContext } from "../types";

// Runtime cache for dynamically loaded presets
const dynamicPresetsCache = new Map<string, IThemeConfigPreset>();

function _useThemeContext() {
  const themeContext = ref<IThemeContext>();

  function setThemeContext(store: StoreResponseType) {
    const themeConfig = getThemeConfig();

    if (!themeConfig) {
      throw new Error("Can't get theme context");
    }

    themeContext.value = {
      ...store,
      settings: themeConfig.settings,
      storeSettings: store.settings,
      defaultPresetName: themeConfig.current,
    };
  }

  async function addPresetToThemeContext(presetName: string): Promise<void> {
    if (!themeContext.value) {
      throw new Error("The global state should be defined");
    }

    let preset = await getPreset(presetNameToFileName(presetName));

    if (!preset) {
      const defaultPresetName = getThemeConfig().current;
      preset = await getPreset(presetNameToFileName(defaultPresetName));
    }

    if (preset) {
      themeContext.value.preset = preset;
    } else {
      throw new Error("Missing preset");
    }
  }

  function getThemeConfig() {
    const data = cloneDeep(settingsData) as IThemeConfig;

    if (IS_DEVELOPMENT && typeof data.settings === "object" && data.settings !== null) {
      data.settings.details_browser_target = BrowserTargetType.SELF;
      data.settings.product_page_browser_target = BrowserTargetType.SELF;
      data.settings.cart_page_browser_target = BrowserTargetType.SELF;
    }

    return data;
  }

  async function getPreset(themePresetName: string): Promise<IThemeConfigPreset | null> {
    // Check statically bundled presets first
    if (themePresetName in presets) {
      return presets[themePresetName];
    }

    // Check runtime cache for dynamically loaded presets
    if (dynamicPresetsCache.has(themePresetName)) {
      return dynamicPresetsCache.get(themePresetName)!;
    }

    // Attempt to fetch preset from public assets folder
    try {
      const response = await fetch(`/assets/presets/${themePresetName}.json`);

      if (response.ok) {
        const preset = (await response.json()) as IThemeConfigPreset;

        // Cache the dynamically loaded preset
        dynamicPresetsCache.set(themePresetName, preset);

        return preset;
      }
    } catch (error) {
      // Network or parsing errors - log and fall through to default
      console.warn(`Failed to load preset "${themePresetName}" from /assets/presets/:`, error);
    }

    // Fall back to default preset
    return presets.default;
  }

  function presetNameToFileName(name: string): string {
    return name.toLowerCase().replace(" ", "-");
  }

  return {
    setThemeContext,
    addPresetToThemeContext,
    themeContext: computed({
      get() {
        if (!themeContext.value) {
          throw new Error("Theme context is missing.");
        }

        return themeContext.value;
      },

      set() {
        throw new Error("Theme context change is not available.");
      },
    }),
    modulesSettings: computed(() => {
      return themeContext.value?.storeSettings?.modules;
    }),
  };
}

export const useThemeContext = createGlobalState(_useThemeContext);
