import { watch } from "vue";
import { useDarkMode } from "@/core/composables/useDarkMode";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { writeThemeVariables } from "@/core/plugins/config.plugin";
import { useThemeSnapshot } from "./useThemeSnapshot";

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
