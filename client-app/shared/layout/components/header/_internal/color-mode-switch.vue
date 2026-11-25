<template>
  <VcTabSwitchGroup
    :model-value="colorMode"
    class="color-mode-switch"
    data-test-id="preferences-menu-color-modes"
    @change="select"
  >
    <VcTabSwitch
      v-for="mode in COLOR_MODES"
      :key="mode.value"
      :value="mode.value"
      :icon="mode.icon"
      :label="$t(`shared.layout.header.preferences_menu.color_modes.${mode.value}`)"
      size="sm"
      class="color-mode-switch__mode"
      :data-test-id="`preferences-menu-color-mode-${mode.value}`"
    />
  </VcTabSwitchGroup>
</template>

<script setup lang="ts">
import { useDarkMode } from "@/core/composables/useDarkMode";

// The icons of the dark mode toggle (useDarkMode's colorModeIcon).
const COLOR_MODES = [
  { value: "light", icon: "sun" },
  { value: "dark", icon: "moon" },
  { value: "system", icon: "desktop-computer" },
] as const;

const { colorMode } = useDarkMode();

function select(value: VcTabSwitchGroupValueType): void {
  const mode = COLOR_MODES.find((item) => item.value === value);

  if (mode) {
    colorMode.value = mode.value;
  }
}
</script>
