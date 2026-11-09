import { createGlobalState } from "@vueuse/core";
import { cloneDeep } from "lodash-es";
import { computed, ref } from "vue";
import { darkPresets, presets } from "@/assets/presets";
import settingsData from "@/config/settings_data.json";
import { presetNameToFileName } from "@/core/utilities";
import { resolveDesign, setPresetAttribute } from "@/core/utilities/design";
import { IS_DEVELOPMENT } from "../constants";
import { BrowserTargetType } from "../enums";
import type { StoreResponseType } from "../api/graphql/types";
import type { IThemeConfig, IThemeConfigPreset, IThemeContext } from "../types";
import type { IThemePalette } from "@/core/theme-snapshot/types";

const loadedPresets = new Map<string, IThemeConfigPreset>();

export function getPredefinedPreset(presetName: string): IThemeConfigPreset | null {
  if (presetName in presets) {
    return presets[presetName];
  }
  return null;
}

export async function loadPreset(presetName: string): Promise<IThemeConfigPreset | null> {
  if (loadedPresets.has(presetName)) {
    return loadedPresets.get(presetName)!;
  }

  try {
    const response = await fetch(`/assets/presets/${presetName}.json`);

    if (response.ok) {
      const preset = (await response.json()) as IThemeConfigPreset;
      loadedPresets.set(presetName, preset);
      return preset;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to load preset "${presetName}" from /assets/presets/:`, error);
  }

  return null;
}

export async function getPreset(presetName: string): Promise<IThemeConfigPreset | null> {
  const predefinedPreset = getPredefinedPreset(presetName);
  if (predefinedPreset) {
    return predefinedPreset;
  }

  const loadedPreset = await loadPreset(presetName);
  if (loadedPreset) {
    return loadedPreset;
  }

  return null;
}

function getThemeConfig() {
  const data = cloneDeep(settingsData) as IThemeConfig;

  if (typeof data.settings === "object" && data.settings !== null) {
    data.settings.design = resolveDesign(data.settings.design);

    if (IS_DEVELOPMENT) {
      data.settings.details_browser_target = BrowserTargetType.SELF;
      data.settings.product_page_browser_target = BrowserTargetType.SELF;
      data.settings.cart_page_browser_target = BrowserTargetType.SELF;
    }
  }

  return data;
}

function _useThemeContext() {
  const themeContext = ref<IThemeContext>();
  /** The preset `addPresetToThemeContext` loaded, which the theme's palette replaces while it has one. */
  let presetPalette: { light: IThemeConfigPreset; dark?: IThemeConfigPreset } | undefined;

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

    let resolvedName = presetNameToFileName(presetName);
    let preset = await getPreset(resolvedName);

    if (!preset) {
      const defaultPresetName = getThemeConfig().current;
      resolvedName = presetNameToFileName(defaultPresetName);
      preset = await getPreset(resolvedName);
    }

    if (preset) {
      themeContext.value.preset = preset;
      themeContext.value.darkPreset = darkPresets[resolvedName];
      themeContext.value.activePresetName = resolvedName;
      presetPalette = { light: preset, dark: darkPresets[resolvedName] };
      setPresetAttribute(resolvedName);
    } else {
      throw new Error("Missing preset");
    }
  }

  /**
   * Puts the Page Builder theme's palette over the preset, or the preset back without one; a token the palette lacks
   * keeps the preset's value. Call it only when white-labeling chose no preset: its preset replaces the whole palette,
   * and the two are never mixed.
   */
  function setThemePalette(palette: IThemePalette | undefined): void {
    if (!themeContext.value) {
      throw new Error("The global state should be defined");
    }

    // Nothing checks that a palette has every token, and a storefront release can add one that older snapshots lack.
    const source = palette
      ? {
          light: { ...presetPalette?.light, ...palette.light } as IThemeConfigPreset,
          dark: palette.dark ? ({ ...presetPalette?.dark, ...palette.dark } as IThemeConfigPreset) : undefined,
        }
      : presetPalette;

    if (source) {
      themeContext.value.preset = source.light;
      themeContext.value.darkPreset = source.dark;
    }
  }

  return {
    setThemeContext,
    addPresetToThemeContext,
    setThemePalette,
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
