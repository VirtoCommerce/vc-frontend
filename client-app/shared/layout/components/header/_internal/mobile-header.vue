<template>
  <header :class="['mobile-header', { 'mobile-header--stuck': stuck }]">
    <div class="mobile-header__shell">
      <div ref="plate" class="mobile-header__plate">
        <!-- region Default slot -->
        <transition :name="isAnimated ? 'slide-fade-top' : ''" mode="out-in">
          <div v-if="customSlots.default" class="mobile-header__bar mobile-header__bar--custom">
            <component :is="customSlots.default" />
          </div>

          <div v-else class="mobile-header__bar">
            <!-- region Left slot -->
            <component :is="customSlots.left" v-if="customSlots.left" />

            <div v-else class="mobile-header__side">
              <button
                ref="burger"
                :aria-label="$t('common.labels.main_menu')"
                type="button"
                class="mobile-header__button mobile-header__button--burger"
                @click="mobileMenuVisible = true"
              >
                <VcIcon name="menu" :size="26" />
              </button>

              <router-link class="mobile-header__brand" :to="$context.settings.default_return_url ?? '/'">
                <VcImage :src="logoUrl" :alt="$context.storeName" class="mobile-header__logo" lazy />
              </router-link>
            </div>
            <!-- endregion Left slot -->

            <!-- region Right slot -->
            <component :is="customSlots.right" v-if="customSlots.right" />

            <div v-else class="mobile-header__side mobile-header__side--end">
              <button
                :aria-label="$t('common.labels.toggle_search_bar')"
                type="button"
                class="mobile-header__button"
                @click="toggleSearchBar"
              >
                <VcIcon name="search" :size="24" />
              </button>

              <ExtensionPointList category="mobileHeader" class="mobile-header__button" />

              <router-link
                :to="{ name: ROUTES.CART.NAME }"
                :aria-label="$t('common.links.cart')"
                class="mobile-header__button"
              >
                <span class="mobile-header__cart">
                  <VcIcon name="cart" :size="24" />

                  <transition
                    mode="out-in"
                    enter-from-class="scale-0"
                    leave-to-class="scale-0"
                    enter-active-class="will-change-transform"
                    leave-active-class="will-change-transform"
                  >
                    <VcBadge
                      v-if="cart?.itemsQuantity"
                      variant="solid"
                      size="sm"
                      class="mobile-header__badge"
                      rounded
                      nowrap
                      max-width="none"
                    >
                      {{ $n(cart.itemsQuantity, { style: "decimal", notation: "compact" }) }}
                    </VcBadge>
                  </transition>
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
    </div>
  </header>

  <!-- Mobile menu -->
  <transition name="mobile-menu">
    <MobileMenu v-if="mobileMenuVisible" class="print:hidden" @close="closeMenu" />
  </transition>
</template>

<script setup lang="ts">
import { syncRefs, useCssVar, useElementSize, useScrollLock } from "@vueuse/core";
import { computed, nextTick, ref, watch } from "vue";
import { useWhiteLabeling } from "@/core/composables";
import { ROUTES } from "@/router/routes/constants";
import { useShortCart } from "@/shared/cart";
import { useNestedMobileHeader } from "@/shared/layout";
import { useSearchBar } from "@/shared/layout/composables/useSearchBar";
import { useStuckPlate } from "@/shared/layout/composables/useStuckPlate";
import MobileMenu from "./mobile-menu/mobile-menu.vue";
import MobileSearchBar from "./mobile-search-bar.vue";

const mobileMenuVisible = ref(false);
const plate = ref<HTMLElement | null>(null);
const burger = ref<HTMLElement | null>(null);
const { stuck } = useStuckPlate(plate);

const { customSlots, isAnimated } = useNestedMobileHeader();
const { searchBarVisible, toggleSearchBar } = useSearchBar();

const { height } = useElementSize(plate);
const { cart } = useShortCart();
const { logoUrl } = useWhiteLabeling();

// The PLATE, not the header: the shell's air scrolls away and only what the plate paints stays
// on screen. VcHeader owns this var on desktop.
const appHeaderHeightVar = useCssVar("--vc-app-header-height");

watch(
  height,
  (value) => {
    appHeaderHeightVar.value = `${value}px`;
  },
  { immediate: true },
);

// The menu unmounts with focus inside it, so the trigger takes it back — otherwise the next Tab
// restarts at the top of the document.
async function closeMenu() {
  mobileMenuVisible.value = false;
  await nextTick();
  burger.value?.focus();
}

const isScrollLocked = computed(() => mobileMenuVisible.value || searchBarVisible.value);
const scrollLock = useScrollLock(document.body);

syncRefs(isScrollLocked, scrollLock);
</script>

<style lang="scss">
.mobile-header {
  $stuck: "";

  --glass: var(--header-plate-glass, var(--header-bottom-bg-color));

  @apply sticky z-40;

  // The gutters and the step above the plate are air; an element there would swallow taps meant
  // for the page under it. The plate takes the events back.
  @apply pointer-events-none;

  // The shell's top padding, negated, so the plate lands flush at viewport 0 when it pins.
  top: calc(-1 * var(--page-stack, 1.5rem));

  @media print {
    @apply hidden;
  }

  &--stuck {
    $stuck: &;
  }

  &__shell {
    @apply relative mx-auto;

    --gutter: var(--page-gutter, theme("padding.6"));

    max-width: calc(var(--vc-container-max-width, 87.75rem) + 2 * var(--gutter));
    padding: var(--page-stack, 1.5rem) var(--gutter) 0;
  }

  &__plate {
    // No overflow clipping: the search panel hangs below the bar and would be cut off.
    @apply pointer-events-auto relative;

    // Its own stacking context, or a neighbouring plate's backdrop-filter drags this one's
    // content into the blur in Safari (WebKit #98538).
    isolation: isolate;
    border-radius: var(--plate-radius, 1.75rem);
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--glass) 94%, transparent),
      color-mix(in srgb, var(--glass) 82%, transparent) 58%,
      color-mix(in srgb, var(--glass) 86%, transparent)
    );
    backdrop-filter: saturate(190%) blur(22px);
    box-shadow:
      inset 0 1px 0 var(--glass-sheen, color-mix(in srgb, var(--glass) 85%, transparent)),
      inset 0 -1px 0 var(--glass-under, transparent),
      var(--glass-shadow, 0 10px 34px color-mix(in srgb, var(--header-bottom-text-color) 10%, transparent));
    color: var(--header-bottom-text-color);
    transition: border-radius var(--transition-duration, 0.2s) ease;

    // Where the browser cannot blur, the glass falls back to the solid header colour.
    @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
      background: var(--glass);
    }

    // Flush against the window edge, hanging over the page: square top, deeper shadow.
    #{$stuck} & {
      @apply rounded-t-none;

      box-shadow:
        inset 0 1px 0 var(--glass-sheen, color-mix(in srgb, var(--glass) 85%, transparent)),
        inset 0 -1px 0 var(--glass-under, transparent),
        var(--plate-shadow-lift, 0 18px 44px color-mix(in srgb, var(--header-bottom-text-color) 12%, transparent));
    }

    // `__content`, not the `.mobile-search-bar` wrapper: the wrapper is always in the tree and
    // only the panel inside it appears with the search.
    &:has(.mobile-search-bar__content) {
      @apply rounded-b-none;

      --mobile-search-bar-radius: var(--plate-radius, 1.75rem);
    }
  }

  &__bar {
    // Above the search panel and its backdrop, so the row stays lit while the panel is out.
    @apply relative z-20 flex h-14 w-full items-center justify-between gap-x-2;

    // A page replacing the whole row through the nested-header slot sizes itself.
    &--custom {
      @apply block h-auto;
    }
  }

  &__side {
    @apply flex h-full min-w-0 items-center;

    &--end {
      @apply flex-none pe-3;
    }
  }

  &__button {
    @apply flex items-center px-1 py-2;

    color: var(--mobile-header-icon-color, theme("colors.primary.DEFAULT"));

    @media (width >= theme("screens.xs")) {
      @apply px-2;
    }

    &--burger {
      @apply h-full pe-2 ps-5;
    }
  }

  &__brand {
    @apply min-w-0;
  }

  &__logo {
    @apply h-8;
  }

  &__cart {
    @apply relative block;
  }

  &__badge {
    @apply absolute -end-2 -top-2 transition-transform;
  }
}
</style>
