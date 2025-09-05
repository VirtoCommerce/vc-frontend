<template>
  <!-- Mobile header -->
  <MobileHeader v-if="isMobile" />

  <!-- Desktop header -->
  <template v-else>
    <TopHeader class="relative z-[21] border-b border-neutral-300 print:hidden" />

    <div ref="stickyHeader" class="sticky top-0 z-20 shadow-md print:hidden">
      <BottomHeader :is-menu-shown="desktopMenuMode === DESKTOP_MENU_MODES.fullscreen" />

      <MegaMenu v-if="isMegamenuShown" class="border-y border-neutral-200" />
    </div>

    <div class="hidden items-start justify-between print:flex">
      <VcImage :src="logoUrl" :alt="$context.storeName" class="h-12" />

      <Created />
    </div>
  </template>
</template>

<script setup lang="ts">
import { useBreakpoints, useElementBounding, useCssVar } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { useWhiteLabeling, useThemeContext } from "@/core/composables";
import { BREAKPOINTS, DESKTOP_MENU_MODES } from "@/core/constants";
import { useUser } from "@/shared/account";
import Created from "../print/created.vue";
import BottomHeader from "./_internal/bottom-header.vue";
import MegaMenu from "./_internal/mega-menu.vue";
import MobileHeader from "./_internal/mobile-header.vue";
import TopHeader from "./_internal/top-header.vue";

const OFFSET_TOP = 20;

const breakpoints = useBreakpoints(BREAKPOINTS);
const { logoUrl } = useWhiteLabeling();
const { themeContext } = useThemeContext();

const stickyHeader = ref<HTMLElement | null>(null);
const headerHeightVar = useCssVar("--vc-layout-sidebar-offset-top");

// For optimization on mobile devices
const isMobile = breakpoints.smaller("lg");
const { height: headerHeight } = useElementBounding(stickyHeader);

const desktopMenuMode = computed(() => themeContext.value?.settings?.desktop_menu_mode);

watch(headerHeight, (value) => {
  headerHeightVar.value = `${value + OFFSET_TOP}px`;
});

const { isAuthenticated } = useUser();

const isMegamenuShown = computed(() => {
  return (
    desktopMenuMode.value === DESKTOP_MENU_MODES.horizontal &&
    (isAuthenticated.value || themeContext.value.storeSettings.anonymousUsersAllowed)
  );
});
</script>
