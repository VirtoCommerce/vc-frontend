import { createGlobalState, useLocalStorage, useMediaQuery } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { darkPresets } from "@/assets/presets";

type ColorModeType = "light" | "dark" | "system";

const DARK_AVAILABLE_KEY = "vc-dark-available";

function _useDarkMode() {
  // IMPORTANT: The serialized format of this value is read by the inline FOUC
  // script in index.html. If you change the serializer, update that script too.
  const storedMode = useLocalStorage<ColorModeType>("vc-color-mode", "system");
  const systemPrefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const activePresetName = ref<string>();

  const isDarkModeAvailable = computed(() => {
    return !!activePresetName.value && activePresetName.value in darkPresets;
  });

  const isDark = computed(() => {
    if (!isDarkModeAvailable.value) {
      return false;
    }
    if (storedMode.value === "system") {
      return systemPrefersDark.value;
    }
    return storedMode.value === "dark";
  });

  // Sync html.dark class with isDark state, but only after preset is known.
  // Before that, the FOUC script in index.html manages the class.
  watch(
    isDark,
    (value) => {
      if (activePresetName.value !== undefined) {
        document.documentElement.classList.toggle("dark", value);
      }
    },
    { immediate: true },
  );

  function setActivePreset(presetName: string) {
    activePresetName.value = presetName;
    // Force DOM sync now that the preset is known
    document.documentElement.classList.toggle("dark", isDark.value);
    // Persist availability flag so the FOUC script in index.html can check it
    localStorage.setItem(DARK_AVAILABLE_KEY, JSON.stringify(isDarkModeAvailable.value));
  }

  function toggle() {
    // Adaptive cycle: first click from "system" always gives a visible change
    // System dark:  system → light → dark → system
    // System light: system → dark → light → system
    const cycle: ColorModeType[] = systemPrefersDark.value ? ["system", "light", "dark"] : ["system", "dark", "light"];
    const currentIndex = cycle.indexOf(storedMode.value);
    storedMode.value = cycle[(currentIndex + 1) % cycle.length];
  }

  const colorModeIcon = computed(() => {
    switch (storedMode.value) {
      case "dark":
        return "moon";
      case "light":
        return "sun";
      default:
        return "desktop-computer";
    }
  });

  return {
    isDark,
    isDarkModeAvailable,
    colorMode: storedMode,
    colorModeIcon,
    setActivePreset,
    toggle,
  };
}

export const useDarkMode = createGlobalState(_useDarkMode);
