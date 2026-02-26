<template>
  <VcTooltip placement="bottom">
    <template #trigger>
      <button
        type="button"
        class="flex cursor-pointer items-center p-1 text-[--header-top-text-color] hover:text-[--header-top-link-color]"
        data-test-id="dark-mode-toggle"
        :aria-label="$t(`shared.layout.header.top_header.dark_mode.${colorMode}`)"
        @click="toggle"
      >
        <VcIcon :name="colorModeIcon" size="sm" />
      </button>
    </template>

    <template #content>
      {{ $t(`shared.layout.header.top_header.dark_mode.${colorMode}`) }}
    </template>
  </VcTooltip>
</template>

<script setup lang="ts">
import { useDarkMode } from "@/core/composables";

const { colorMode, colorModeIcon, toggle } = useDarkMode();
</script>
