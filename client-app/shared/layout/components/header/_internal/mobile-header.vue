<template>
  <header ref="headerElement" class="mobile-header">
    <div class="mobile-header__top">
      <ShipToSelector />
    </div>

    <div class="mobile-header__bottom">
      <!-- region Default slot -->
      <transition :name="isAnimated ? 'slide-fade-top' : ''" mode="out-in">
        <div v-if="customSlots.default" class="mobile-header__custom">
          <component :is="customSlots.default" />
        </div>

        <div v-else class="mobile-header__bar">
          <!-- region Left slot -->
          <component :is="customSlots.left" v-if="customSlots.left" />

          <div v-else class="mobile-header__left">
            <button
              :aria-label="$t('common.labels.main_menu')"
              type="button"
              class="mobile-header__menu-button"
              @click="mobileMenuVisible = true"
            >
              <VcIcon class="mobile-header__icon" name="menu" :size="24" />
            </button>

            <router-link :to="$context.settings.default_return_url ?? '/'">
              <VcImage :src="logoUrl" :alt="$context.storeName" class="mobile-header__logo" lazy />
            </router-link>
          </div>
          <!-- endregion Left slot -->

          <!-- region Right slot -->
          <component :is="customSlots.right" v-if="customSlots.right" />

          <div v-else class="mobile-header__right">
            <a
              v-if="support_phone_number"
              :aria-label="$t('common.labels.support_phone_number')"
              class="mobile-header__action"
              :href="`tel:${support_phone_number}`"
            >
              <VcIcon class="mobile-header__icon" name="phone" :size="24" />
            </a>

            <button
              :aria-label="$t('common.labels.toggle_search_bar')"
              type="button"
              class="mobile-header__action"
              @click="toggleSearchBar"
            >
              <VcIcon class="mobile-header__icon" name="search" :size="24" />
            </button>

            <ExtensionPointList category="mobileHeader" class="mobile-header__action" />

            <router-link
              :to="{ name: ROUTES.CART.NAME }"
              :aria-label="getCountLabel($t('common.links.cart'), cart?.itemsQuantity)"
              class="mobile-header__action"
            >
              <span class="mobile-header__cart">
                <VcIcon class="mobile-header__icon" name="cart" :size="24" />

                <HeaderBadge :count="cart?.itemsQuantity" size="sm" overlay />
              </span>
            </router-link>
          </div>
          <!-- endregion Right slot -->
        </div>
      </transition>
      <!-- endregion Default slot -->

      <!-- region Mobile Search Bar -->
      <MobileSearchBar :visible="searchBarVisible" />
      <!-- endregion Mobile Search Bar -->
    </div>
  </header>

  <!-- Height placeholder for mobile header due to fixed position -->
  <div :style="placeholderStyle" class="mobile-header__placeholder"></div>

  <!-- Mobile menu -->
  <transition
    enter-from-class="mobile-header__menu--offscreen"
    leave-to-class="mobile-header__menu--offscreen"
    enter-active-class="mobile-header__menu--moving"
    leave-active-class="mobile-header__menu--moving"
  >
    <MobileMenu
      v-if="mobileMenuVisible"
      class="mobile-header__menu"
      :class="{ 'is-visible': mobileMenuVisible }"
      @close="mobileMenuVisible = false"
    />
  </transition>
</template>

<script setup lang="ts">
import { syncRefs, useCssVar, useElementBounding, useElementSize, useScrollLock } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { useWhiteLabeling } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { ROUTES } from "@/router/routes/constants";
import { useShortCart } from "@/shared/cart";
import { useNestedMobileHeader } from "@/shared/layout";
import { useHeaderCountLabel } from "@/shared/layout/composables/useHeaderCountLabel";
import { useSearchBar } from "@/shared/layout/composables/useSearchBar";
import { ShipToSelector } from "@/shared/ship-to-location";
import MobileMenu from "./mobile-menu/mobile-menu.vue";
import MobileSearchBar from "./mobile-search-bar.vue";
import type { StyleValue } from "vue";
import HeaderBadge from "@/shared/layout/components/header-badge/header-badge.vue";

const mobileMenuVisible = ref(false);
const headerElement = ref(null);

const { getSettingValue } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);
const support_phone_number = getSettingValue(MODULE_XAPI_KEYS.SUPPORT_PHONE_NUMBER);

const { customSlots, isAnimated } = useNestedMobileHeader();
const { searchBarVisible, toggleSearchBar } = useSearchBar();
const { getCountLabel } = useHeaderCountLabel();

const { height } = useElementSize(headerElement);
const { bottom } = useElementBounding(headerElement);
const { cart } = useShortCart();
const { logoUrl } = useWhiteLabeling();

const placeholderStyle = computed<StyleValue | undefined>(() =>
  height.value ? { height: height.value + "px" } : undefined,
);

// Exact app header height, kept live so sticky elements elsewhere (e.g. tables with a sticky
// header row) can sit flush below this fixed mobile header instead of under it. AppHeader owns
// this var on desktop (see app-header.vue). The bottom edge, so the frame's space above the header counts too.
const appHeaderHeightVar = useCssVar("--vc-app-header-height");

watch(
  bottom,
  (value) => {
    appHeaderHeightVar.value = `${value}px`;
  },
  { immediate: true },
);

const isScrollLocked = computed(() => mobileMenuVisible.value || searchBarVisible.value);
const scrollLock = useScrollLock(document.body);

syncRefs(isScrollLocked, scrollLock);
</script>

<style lang="scss">
// Three roots: the fixed header, its placeholder in the page flow, and the menu.
.mobile-header {
  @apply fixed z-40 shadow-md;

  inset-inline: var(--vc-frame-header-offset-x, 0px);
  inset-block-start: var(--vc-frame-header-offset-top, var(--vc-frame-gap, 0px));

  @media print {
    @apply hidden;
  }

  &__top {
    @apply relative z-[2] flex h-[2.125rem] items-center border-b bg-[--header-top-bg-color] px-5 py-1 text-xs;
  }

  &__bottom {
    @apply relative z-[1];
  }

  &__custom {
    @apply relative z-20 bg-[--header-bottom-bg-color];
  }

  &__bar {
    @apply relative z-20 flex h-14 w-full items-center justify-between gap-x-2 border-b bg-[--header-bottom-bg-color];

    @media (width >= theme("screens.sm")) {
      @apply gap-x-6;
    }
  }

  &__left {
    @apply flex h-full items-center;
  }

  &__menu-button {
    @apply h-full pe-3 ps-5;

    @media (width >= theme("screens.sm")) {
      @apply pe-5;
    }
  }

  &__icon {
    --vc-icon-color: var(--color-primary-500);
  }

  &__logo {
    @apply h-8;
  }

  &__right {
    @apply flex h-full flex-row items-center pe-4;
  }

  &__action {
    @apply px-1 py-2;

    @media (width >= theme("screens.xs")) {
      @apply px-2;
    }
  }

  &__cart {
    @apply relative block;
  }

  &__placeholder {
    @apply h-14;

    @media print {
      @apply hidden;
    }
  }

  // The menu hides itself on paper (its root's own `flex` utility would beat a rule here).
  &__menu {
    @apply transition-transform;

    &--offscreen {
      @apply -translate-x-full;
    }

    &--moving {
      @apply will-change-transform;
    }
  }
}
</style>
