<template>
  <header :class="['mobile-header', { 'mobile-header--stuck': stuck }]">
    <div class="mobile-header__shell">
      <div ref="plate" class="mobile-header__plate">
        <!-- region Default slot -->
        <transition :name="isAnimated ? 'slide-fade-top' : ''" mode="out-in">
          <div v-if="customSlots.default" class="mobile-header__bar">
            <component :is="customSlots.default" />
          </div>

          <div v-else class="mobile-header__bar">
            <!-- region Left slot -->
            <component :is="customSlots.left" v-if="customSlots.left" />

            <div v-else class="mobile-header__side">
              <button
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
    <MobileMenu v-if="mobileMenuVisible" class="print:hidden" @close="mobileMenuVisible = false" />
  </transition>
</template>

<script setup lang="ts">
import { syncRefs, useCssVar, useElementSize, useEventListener, useScrollLock } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { useWhiteLabeling } from "@/core/composables";
import { ROUTES } from "@/router/routes/constants";
import { useShortCart } from "@/shared/cart";
import { useNestedMobileHeader } from "@/shared/layout";
import { useSearchBar } from "@/shared/layout/composables/useSearchBar";
import MobileMenu from "./mobile-menu/mobile-menu.vue";
import MobileSearchBar from "./mobile-search-bar.vue";

const mobileMenuVisible = ref(false);
const plate = ref<HTMLElement | null>(null);
const stuck = ref(false);

const { customSlots, isAnimated } = useNestedMobileHeader();
const { searchBarVisible, toggleSearchBar } = useSearchBar();

const { height } = useElementSize(plate);
const { cart } = useShortCart();
const { logoUrl } = useWhiteLabeling();

// Exact app header height, kept live so sticky elements elsewhere (e.g. tables with a sticky
// header row) can sit flush below the pinned plate instead of under it. VcHeader owns this var
// on desktop (see vc-header.vue). The PLATE is measured, not the header: the air the shell
// keeps above it scrolls away, and only what the plate paints stays on screen.
const appHeaderHeightVar = useCssVar("--vc-app-header-height");

watch(
  height,
  (value) => {
    appHeaderHeightVar.value = `${value}px`;
  },
  { immediate: true },
);

// Read from geometry rather than scrollY — correct through anchor jumps, resizes and pages that
// do not start at zero. Capture phase, because the scroll may happen on an inner container.
// Same rule as the desktop plate (header-plate.vue), so both headers pin on one definition.
function updateStuck() {
  const element = plate.value;

  if (element) {
    stuck.value = element.getBoundingClientRect().top <= 0.5;
  }
}

useEventListener("scroll", updateStuck, { passive: true, capture: true });
useEventListener("resize", updateStuck);
watch(plate, updateStuck, { flush: "post" });

const isScrollLocked = computed(() => mobileMenuVisible.value || searchBarVisible.value);
const scrollLock = useScrollLock(document.body);

syncRefs(isScrollLocked, scrollLock);
</script>

<style lang="scss">
.mobile-header {
  $stuck: "";

  --glass: var(--header-bottom-bg-color);

  // Sticky, not fixed: the header is a plate in the page's own column, so it travels with the
  // page and pins at the top edge — the same thing the desktop plate does, and the reason the
  // page no longer needs a spacer element standing in for a header that had left the flow.
  @apply sticky z-40;

  // Everything around the plate is air: the gutters down both sides and the step above it. An
  // element there would lie over the page as an invisible lid and swallow taps meant for the
  // content — in 12px of gutter that is a dead strip along both edges. The plate takes the
  // events back.
  @apply pointer-events-none;

  // The shell's top padding, negated: the plate then lands flush at viewport 0 when the header
  // pins, which is also the geometry it reads to decide it is stuck.
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
    // No overflow clipping: the search panel hangs below the bar and would be cut off. Its own
    // corners are rounded instead, and the plate gives its bottom pair up while it is open.
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
      var(--plate-shadow, 0 10px 34px color-mix(in srgb, var(--header-bottom-text-color) 10%, transparent));
    color: var(--header-bottom-text-color);
    transition: border-radius var(--transition-duration, 0.2s) ease;

    // A translucent plate with nothing behind it is a washed-out surface, so where the browser
    // cannot blur, the glass falls back to the solid header colour.
    @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
      background: var(--glass);
    }

    // Flush against the window edge the top corners have nothing to round against, and the
    // plate now hangs over the page — it takes the deeper shadow while it does.
    #{$stuck} & {
      @apply rounded-t-none;

      box-shadow:
        inset 0 1px 0 var(--glass-sheen, color-mix(in srgb, var(--glass) 85%, transparent)),
        inset 0 -1px 0 var(--glass-under, transparent),
        var(--plate-shadow-lift, 0 18px 44px color-mix(in srgb, var(--header-bottom-text-color) 12%, transparent));
    }

    // The open search panel continues the plate downwards, so the seam between them has to be
    // straight. `__content` and not the `.mobile-search-bar` wrapper: the wrapper is always in
    // the tree and only the panel inside it appears with the search.
    &:has(.mobile-search-bar__content) {
      @apply rounded-b-none;

      --mobile-search-bar-radius: var(--plate-radius, 1.75rem);
    }
  }

  &__bar {
    // Above the search panel and its backdrop: the panel slides out from under the row, and the
    // row stays lit while it is open.
    @apply relative z-20 flex h-14 w-full items-center justify-between gap-x-2;
  }

  &__side {
    @apply flex h-full min-w-0 items-center;

    &--end {
      @apply flex-none pe-3;
    }
  }

  &__button {
    @apply flex items-center px-1 py-2 xs:px-2;

    color: var(--mobile-header-icon-color, theme("colors.primary.DEFAULT"));

    // A module can put a link in this row through the `mobileHeader` extension point, and the
    // one that does (push messages) renders the header's own link block — which carries a
    // caption under its icon. The row is 56 tall and four icons wide; the captions are what
    // the pinned desktop plate collapses, and these are the properties it collapses them with.
    --header-link-label-max-h: 0px;
    --header-link-label-max-w: 0px;
    --header-link-label-opacity: 0;
    --header-link-pad-x: 0px;

    // The one control on the row that is not an icon in a row of icons: it opens the menu, and
    // the design gives it the plate's own inside on the left so the glyph lines up with the
    // logo beside it rather than with the plate's edge.
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
