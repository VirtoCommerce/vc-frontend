<template>
  <!-- Mobile header -->
  <MobileHeader v-if="isMobile" />

  <!-- Desktop header -->
  <template v-else>
    <TopHeader class="app-header__top" />

    <div ref="stickyHeader" class="app-header__sticky">
      <BottomHeader :is-menu-shown="desktopMenuMode === DESKTOP_MENU_MODES.fullscreen" />

      <MegaMenu v-if="isMegamenuShown" class="app-header__mega-menu" />
    </div>

    <div class="app-header__print">
      <VcImage :src="logoUrl" :alt="$context.storeName" class="app-header__print-logo" />

      <Created />
    </div>
  </template>
</template>

<script setup lang="ts">
import { useBreakpoints, useElementBounding, useCssVar } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { useWhiteLabeling, useThemeContext } from "@/core/composables";
import { DESKTOP_MENU_MODES } from "@/core/constants";
import { useUser } from "@/shared/account";
import { BREAKPOINTS } from "@/ui-kit/constants";
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
// Exact sticky header height (no offset buffer), so other components (e.g. sticky elements that
// need to sit flush below the app header) can rely on it too. Only updated here for desktop —
// MobileHeader owns this var while it's the one rendered (see mobile-header.vue).
const appHeaderHeightVar = useCssVar("--vc-app-header-height");

// For optimization on mobile devices
const isMobile = breakpoints.smaller("lg");
const { height: headerHeight } = useElementBounding(stickyHeader);

const desktopMenuMode = computed(() => themeContext.value?.settings?.desktop_menu_mode);

watch(headerHeight, (value) => {
  headerHeightVar.value = `${value + OFFSET_TOP}px`;
});

watch([headerHeight, isMobile], ([value, mobile]) => {
  if (mobile) {
    return;
  }

  appHeaderHeightVar.value = `${value}px`;
});

const { isAuthenticated } = useUser();

const isMegamenuShown = computed(() => {
  return (
    desktopMenuMode.value === DESKTOP_MENU_MODES.horizontal &&
    (isAuthenticated.value || themeContext.value.storeSettings.anonymousUsersAllowed)
  );
});
</script>

<style lang="scss">
// A fragment: each piece is a direct child of the page frame, where the sticky part sticks (a wrapper would end it),
// so the block has no root element of its own. TopHeader hides itself on paper.
.app-header {
  &__top {
    @apply relative z-[21] border-b border-neutral-300;

    inline-size: min(100% - 2 * var(--vc-frame-header-offset-x, 0px), var(--vc-frame-max-width, 100%));
    margin-inline: auto;
  }

  &__sticky {
    @apply sticky top-0 z-20 shadow-md;

    inline-size: min(100% - 2 * var(--vc-frame-header-offset-x, 0px), var(--vc-frame-max-width, 100%));
    margin-inline: auto;

    @media print {
      @apply hidden;
    }
  }

  &__mega-menu {
    @apply border-y border-neutral-200;
  }

  &__print {
    @apply hidden items-start justify-between;

    @media print {
      @apply flex;
    }
  }

  &__print-logo {
    @apply h-12;
  }
}
</style>
