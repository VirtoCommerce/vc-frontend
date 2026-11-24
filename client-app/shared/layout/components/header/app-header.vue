<template>
  <div class="app-header">
    <!-- Mobile header -->
    <MobileHeader v-if="isMobile" />

    <!-- Desktop header -->
    <template v-else>
      <AnnouncementBar class="app-header__announcement" />

      <TopHeader class="app-header__top" />

      <div ref="stickyHeader" class="app-header__sticky">
        <BottomHeader :is-menu-shown="isCatalogMenuShown && desktopMenuMode === DESKTOP_MENU_MODES.fullscreen" />

        <MegaMenu v-if="isMegamenuShown" />
      </div>

      <div class="app-header__print">
        <VcImage :src="logoUrl" :alt="$context.storeName" class="app-header__print-logo" />

        <Created />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints, useElementBounding, useCssVar } from "@vueuse/core";
import { computed, onActivated, onDeactivated, ref, watch } from "vue";
import { useNavigations, useWhiteLabeling, useThemeContext } from "@/core/composables";
import { DESKTOP_MENU_MODES } from "@/core/constants";
import { useUser } from "@/shared/account";
import { BREAKPOINTS } from "@/ui-kit/constants";
import AnnouncementBar from "../announcement-bar/announcement-bar.vue";
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

const isShown = ref(true);

watch(headerHeight, (value) => {
  headerHeightVar.value = `${value + OFFSET_TOP}px`;
});

// The page's anchors scroll past the header by this height, so a page without the header gets none.
watch([headerHeight, isMobile, isShown], ([value, mobile, shown]) => {
  if (mobile) {
    return;
  }

  appHeaderHeightVar.value = shown ? `${value}px` : undefined;
});

const { isAuthenticated } = useUser();
const { isCatalogMenuShown } = useNavigations();

const isMegamenuShown = computed(() => {
  return (
    isCatalogMenuShown.value &&
    desktopMenuMode.value === DESKTOP_MENU_MODES.horizontal &&
    (isAuthenticated.value || themeContext.value.storeSettings.anonymousUsersAllowed)
  );
});

onActivated(() => {
  isShown.value = true;
});

onDeactivated(() => {
  isShown.value = false;
});
</script>

<style lang="scss">
// `contents`: no box of its own, so each piece stays a flex item of the page frame and the sticky part sticks.
.app-header {
  @apply contents;

  &__announcement {
    @apply mx-auto;

    inline-size: var(--vc-frame-header-width, 100%);
  }

  &__top {
    @apply relative z-[21] mx-auto;

    inline-size: var(--vc-frame-header-width, 100%);
  }

  &__sticky {
    @apply sticky top-0 z-20 mx-auto shadow-md;

    inline-size: var(--vc-frame-header-width, 100%);

    @media print {
      @apply hidden;
    }
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
