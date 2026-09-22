<template>
  <!-- Mobile header -->
  <MobileHeader v-if="isMobile" />

  <!-- Desktop header -->
  <template v-else>
    <div ref="stickyHeader" class="app-header">
      <div class="app-header__shell">
        <HeaderPlate
          :is-catalog-button-shown="desktopMenuMode === DESKTOP_MENU_MODES.fullscreen"
          :is-mega-menu-shown="isMegaMenuShown"
        />
      </div>
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
import HeaderPlate from "./_internal/header-plate.vue";
import MobileHeader from "./_internal/mobile-header.vue";

const OFFSET_TOP = 20;

/**
 * VCST-6030 demo branch: set to false to drop the category row from the header plate
 * entirely, leaving the single-row header. The store's `desktop_menu_mode` still decides
 * between the mega menu and the catalog button when this is on.
 */
const MEGA_MENU_ENABLED = true;

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

const isMegaMenuShown = computed(() => {
  return (
    MEGA_MENU_ENABLED &&
    desktopMenuMode.value === DESKTOP_MENU_MODES.horizontal &&
    (isAuthenticated.value || themeContext.value.storeSettings.anonymousUsersAllowed)
  );
});
</script>

<style lang="scss">
.app-header {
  // Sticky lives on the OUTER element: a sticky box can only travel inside its parent,
  // and the shell is exactly as tall as the header. The negative offset equals the
  // shell's top padding, so the plate itself lands flush at viewport 0 when pinned —
  // which is also what header-plate reads to decide it is stuck.
  @apply sticky z-20;

  // The shell's top padding, negated: the plate then lands flush at viewport 0 when the
  // header pins, which is also the geometry header-plate reads to decide it is stuck.
  top: calc(-1 * var(--page-stack, 1.5rem));

  @media print {
    @apply hidden;
  }

  // The page inset and the vertical step the header plate shares with the page's own
  // plates. One step above the plate and the same one below it: in the design every gap
  // in the column — over the header, between plates, under the last one — is --page-stack.
  &__shell {
    @apply relative mx-auto;

    --gutter: var(--page-gutter, theme("padding.6"));

    max-width: calc(var(--vc-container-max-width, 87.75rem) + 2 * var(--gutter));
    padding: var(--page-stack, 1.5rem) var(--gutter);
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
