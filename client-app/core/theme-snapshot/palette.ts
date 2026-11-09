import { watch } from "vue";
import { useDarkMode } from "@/core/composables/useDarkMode";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { writeThemeVariables } from "@/core/plugins/config.plugin";
import { useThemeSnapshot } from "./useThemeSnapshot";
import type { IThemePalette } from "./types";
import type { IThemeConfigPreset } from "@/core/types";

export function setupThemePalette(hasWhiteLabelingPreset: () => boolean): void {
  const { theme } = useThemeSnapshot();
  const { themeContext } = useThemeContext();
  const { setActivePreset } = useDarkMode();
  const presetPalette = { light: themeContext.value.preset, dark: themeContext.value.darkPreset };

  function activatePreset(): void {
    const { activePresetName, defaultPresetName, darkPreset } = themeContext.value;
    setActivePreset(activePresetName ?? defaultPresetName, !!darkPreset);
  }

  function applyPalette(palette: IThemePalette | undefined): void {
    // Nothing checks that a palette has every token, and a storefront release can add one that older snapshots lack.
    const source = palette
      ? {
          light: { ...presetPalette.light, ...palette.light } as IThemeConfigPreset,
          dark: palette.dark ? ({ ...presetPalette.dark, ...palette.dark } as IThemeConfigPreset) : undefined,
        }
      : presetPalette;

    themeContext.value.preset = source.light;
    themeContext.value.darkPreset = source.dark;
  }

  if (!hasWhiteLabelingPreset()) {
    applyPalette(theme.value?.palette);
  }

  activatePreset();

  watch(
    () => theme.value?.palette,
    (palette) => {
      if (hasWhiteLabelingPreset()) {
        return;
      }

      applyPalette(palette);

      const { preset, darkPreset } = themeContext.value;

      if (preset) {
        writeThemeVariables(preset, darkPreset);
        activatePreset();
      }
    },
  );
}
