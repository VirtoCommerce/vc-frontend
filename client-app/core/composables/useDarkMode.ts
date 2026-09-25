import { createGlobalState, useLocalStorage, useMediaQuery } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { darkPresets } from "@/assets/presets";
import { switchColorMode } from "@/core/utilities";

type ColorModeType = "light" | "dark" | "system";

const VALID_MODES = new Set<ColorModeType>(["light", "dark", "system"]);

const DARK_AVAILABLE_KEY = "vc-dark-available";

// The reveal grows out of whatever the pointer last touched. A switch that is not a click —
// the keyboard, or the OS flipping its own preference while the mode is "system" — has no
// point of origin, so anything older than a moment is treated as unrelated and the reveal
// starts from the middle of the viewport instead.
const ORIGIN_MAX_AGE = 1000;

function _useDarkMode() {
  // IMPORTANT: The serialized format of this value is read by the inline FOUC
  // script in index.html. If you change the serializer, update that script too.
  const storedMode = useLocalStorage<ColorModeType>("vc-color-mode", "system");

  // Sanitise value coming from localStorage – if the stored string is not
  // one of the valid modes (e.g. manually corrupted), fall back to "system".
  if (!VALID_MODES.has(storedMode.value)) {
    storedMode.value = "system";
  }

  const systemPrefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const activePresetName = ref<string>();

  let lastPointer: { x: number; y: number; at: number } | null = null;

  document.addEventListener(
    "pointerdown",
    (event: PointerEvent) => {
      lastPointer = { x: event.clientX, y: event.clientY, at: Date.now() };
    },
    { passive: true, capture: true },
  );

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
      // Reading the class back is what separates a real switch from the run that only catches
      // up with what setActivePreset already wrote — and the catch-up must not be animated.
      if (activePresetName.value === undefined || document.documentElement.classList.contains("dark") === value) {
        return;
      }

      switchColorMode(() => document.documentElement.classList.toggle("dark", value), revealOrigin());
    },
    { immediate: true },
  );

  function revealOrigin() {
    return lastPointer && Date.now() - lastPointer.at <= ORIGIN_MAX_AGE ? lastPointer : null;
  }

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
