import { watch } from "vue";
import { useDarkMode } from "@/core/composables/useDarkMode";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { writeThemeVariables } from "@/core/plugins/config.plugin";
import { useThemeSnapshot } from "./useThemeSnapshot";

/**
 * Puts the theme's palette in place of the loaded preset, now and whenever it changes later (a snapshot that arrived
 * late, the designer's draft), and tells dark mode whether the palette has a dark part. Nothing of the theme is used
 * while white-labeling chose a preset: its preset replaces the whole palette.
 */
export function setupThemePalette(hasWhiteLabelingPreset: () => boolean): void {
  const { theme } = useThemeSnapshot();
  const { themeContext, setThemePalette } = useThemeContext();
  const { setActivePreset } = useDarkMode();

  function activatePreset(): void {
    const { activePresetName, defaultPresetName, darkPreset } = themeContext.value;
    setActivePreset(activePresetName ?? defaultPresetName, !!darkPreset);
  }

  if (!hasWhiteLabelingPreset()) {
    setThemePalette(theme.value?.palette);
  }

  activatePreset();

  watch(
    () => theme.value?.palette,
    (palette) => {
      if (hasWhiteLabelingPreset()) {
        return;
      }

      setThemePalette(palette);

      const { preset, darkPreset } = themeContext.value;

      if (preset) {
        writeThemeVariables(preset, darkPreset);
        activatePreset();
      }
    },
  );
}
