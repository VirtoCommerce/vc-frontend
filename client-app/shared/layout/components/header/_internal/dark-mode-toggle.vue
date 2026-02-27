<template>
  <VcTooltip v-if="isDarkModeAvailable && tooltip" class="dark-mode-toggle" placement="bottom">
    <template #trigger>
      <button
        type="button"
        class="dark-mode-toggle__button"
        :data-test-id="testId"
        :aria-label="$t(`shared.layout.header.top_header.dark_mode.${colorMode}`)"
        @click="toggle"
      >
        <VcIcon :name="colorModeIcon" :size="iconSize" />
      </button>
    </template>

    <template #content>
      {{ $t(`shared.layout.header.top_header.dark_mode.${colorMode}`) }}
    </template>
  </VcTooltip>

  <button
    v-else-if="isDarkModeAvailable"
    type="button"
    class="dark-mode-toggle dark-mode-toggle__button"
    :data-test-id="testId"
    :aria-label="$t(`shared.layout.header.top_header.dark_mode.${colorMode}`)"
    @click="toggle"
  >
    <VcIcon :name="colorModeIcon" :size="iconSize" />
  </button>
</template>

<script setup lang="ts">
import { useDarkMode } from "@/core/composables";

interface IProps {
  tooltip?: boolean;
  iconSize?: VcIconSizeType;
  testId?: string;
}

defineProps<IProps>();

const { isDarkModeAvailable, colorMode, colorModeIcon, toggle } = useDarkMode();
</script>

<style lang="scss">
.dark-mode-toggle {
  &__button {
    @apply flex cursor-pointer items-center;
  }
}
</style>
