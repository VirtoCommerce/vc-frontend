<template>
  <button
    type="button"
    class="flex cursor-pointer items-center p-1 text-[--header-top-text-color] hover:text-[--header-top-link-color]"
    :aria-label="
      isDark
        ? $t('shared.layout.header.top_header.dark_mode.switch_to_light')
        : $t('shared.layout.header.top_header.dark_mode.switch_to_dark')
    "
    @click="toggle"
  >
    <VcIcon :name="isDark ? 'sun' : 'moon'" size="sm" />
  </button>
</template>

<script setup lang="ts">
import { useDarkMode } from "@/core/composables";

const { isDark, toggle } = useDarkMode();
</script>
