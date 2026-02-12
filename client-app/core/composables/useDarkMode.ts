import { createGlobalState, useLocalStorage, useMediaQuery } from "@vueuse/core";
import { computed, watch } from "vue";

type ColorModeType = "light" | "dark" | "system";

function _useDarkMode() {
  const storedMode = useLocalStorage<ColorModeType>("vc-color-mode", "system");
  const systemPrefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  const isDark = computed(() => {
    if (storedMode.value === "system") {
      return systemPrefersDark.value;
    }
    return storedMode.value === "dark";
  });

  watch(
    isDark,
    (value) => {
      document.documentElement.classList.toggle("dark", value);
    },
    { immediate: true },
  );

  function setMode(mode: ColorModeType) {
    storedMode.value = mode;
  }

  function toggle() {
    if (storedMode.value === "system") {
      storedMode.value = systemPrefersDark.value ? "light" : "dark";
    } else {
      storedMode.value = storedMode.value === "dark" ? "light" : "dark";
    }
  }

  return {
    isDark,
    mode: storedMode,
    setMode,
    toggle,
  };
}

export const useDarkMode = createGlobalState(_useDarkMode);
