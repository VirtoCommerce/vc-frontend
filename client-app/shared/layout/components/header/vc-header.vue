<template>
  <!-- Mobile header -->
  <MobileHeader v-if="isMobile" />

  <!-- Desktop header -->
  <template v-else>
    <div ref="stickyHeader" class="app-header">
      <div class="app-header__shell">
        <HeaderPill :is-menu-shown="desktopMenuMode === DESKTOP_MENU_MODES.fullscreen" />

        <MegaMenu v-if="isMegamenuShown" />
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
import HeaderPill from "./_internal/header-pill.vue";
import MegaMenu from "./_internal/mega-menu.vue";
import MobileHeader from "./_internal/mobile-header.vue";

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
.app-header {
  @apply sticky top-0 z-20;

  @media print {
    @apply hidden;
  }

  // One shared page inset for the floating pill and the mega menu below it, so the two
  // read as one group. Mirrors VcContainer's gutter steps.
  &__shell {
    @apply relative mx-auto flex flex-col gap-2 pb-2 pt-2.5;

    --gutter: theme("padding.6");

    max-width: calc(var(--vc-container-max-width, 87.75rem) + 2 * var(--gutter));
    padding-inline: var(--gutter);

    @media (width >= theme("screens.lg")) {
      --gutter: theme("padding.8");
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
