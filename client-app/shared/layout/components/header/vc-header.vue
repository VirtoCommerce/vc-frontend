<template>
  <!-- Mobile header -->
  <MobileHeader v-if="isMobile" />

  <!-- Desktop header -->
  <template v-else>
    <TopHeader class="relative z-[21] border-b border-neutral-300 print:hidden" />

    <div class="sticky top-0 z-20 shadow-md print:hidden">
      <BottomHeader :show-menu="desktopMenuMode === DESKTOP_MENU_MODES.fullscreen" />

      <MegaMenu v-if="desktopMenuMode === DESKTOP_MENU_MODES.horizontal" class="border-y border-neutral-200" />
    </div>
  </template>

  <div class="hidden items-start justify-between print:flex">
    <VcImage :src="logoUrl" :alt="$context.storeName" class="h-12" />

    <Created />
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { computed } from "vue";
import { useWhiteLabeling, useThemeContext } from "@/core/composables";
import { BREAKPOINTS, DESKTOP_MENU_MODES } from "@/core/constants";
import Created from "../print/created.vue";
import BottomHeader from "./_internal/bottom-header.vue";
import MegaMenu from "./_internal/mega-menu.vue";
import MobileHeader from "./_internal/mobile-header.vue";
import TopHeader from "./_internal/top-header.vue";

const breakpoints = useBreakpoints(BREAKPOINTS);
const { logoUrl } = useWhiteLabeling();
const { themeContext } = useThemeContext();

// For optimization on mobile devices
const isMobile = breakpoints.smaller("lg");

const desktopMenuMode = computed(() => themeContext.value?.settings?.desktop_menu_mode);
</script>
