<template>
  <div :class="['header-plate', { 'header-plate--stuck': stuck }]">
    <div ref="plate" class="header-plate__surface">
      <nav class="header-plate__row" :aria-label="$t('shared.layout.header.bottom_header.main_menu')">
        <router-link class="header-plate__brand" :to="$context.settings.default_return_url ?? '/'">
          <VcImage :src="logoUrl" :alt="$context.storeName" class="header-plate__logo" lazy />
        </router-link>

        <a
          v-if="isCatalogButtonShown"
          ref="catalogButton"
          class="header-plate__catalog"
          :href="catalogLink"
          aria-haspopup="menu"
          :aria-expanded="catalogMenuVisible"
          @click="toggleCatalogDropdown"
          @keydown.enter="toggleCatalogDropdown"
          @keydown.space="toggleCatalogDropdown"
          @keydown.esc="closeCatalogDropdown"
        >
          {{ $t("shared.layout.header.bottom_header.catalog_menu_button") }}

          <VcIcon v-if="catalogMenuItems.length" :name="catalogButtonIcon" size="xxs" />
        </a>

        <SearchBar class="header-plate__search" />

        <ul class="header-plate__links">
          <li v-for="item in desktopMainMenuItems" :key="item.id" :data-test-id="item.dataTestId">
            <ExtensionPoint category="headerMenu" :name="item.id" :item="item">
              <LinkDefault :item="item" />
            </ExtensionPoint>
          </li>
        </ul>

        <div class="header-plate__end">
          <HeaderPreferencesMenu />

          <HeaderAccountMenu v-if="isAuthenticated" />

          <VcButton v-else :to="ROUTES.SIGN_IN.PATH" size="sm" data-test-id="sign-in-link">
            {{ $t("shared.layout.header.link_sign_in") }}
          </VcButton>
        </div>
      </nav>

      <!-- Second row of the same plate. It collapses to zero height once the plate sticks,
           so a scrolled page keeps a single-row header. -->
      <MegaMenu v-if="isMegaMenuShown" ref="mega" class="header-plate__mega" />
    </div>

    <transition
      v-if="isCatalogButtonShown && catalogMenuItems.length"
      enter-from-class="header-plate__dropdown--hidden"
      leave-to-class="header-plate__dropdown--hidden"
    >
      <div v-if="catalogMenuVisible" ref="catalogMenuElement" class="header-plate__dropdown" :style="dropdownStyle">
        <CatalogMenu
          :items="catalogMenuItems"
          @focusout="focusoutDropdown"
          @close="closeCatalogDropdown"
          @select="closeCatalogDropdown"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside, syncRefs, useElementBounding, useScrollLock } from "@vueuse/core";
import { computed, nextTick, ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useNavigations, useWhiteLabeling } from "@/core/composables";
import { ROUTES } from "@/router/routes/constants";
import { useUser } from "@/shared/account/composables/useUser";
import { useStuckPlate } from "@/shared/layout/composables/useStuckPlate";
import CatalogMenu from "./catalog-menu.vue";
import HeaderAccountMenu from "./header-account-menu.vue";
import HeaderPreferencesMenu from "./header-preferences-menu.vue";
import LinkDefault from "./link-components/link-default.vue";
import MegaMenu from "./mega-menu.vue";
import SearchBar from "./search-bar/search-bar.vue";
import type { StyleValue } from "vue";

interface IProps {
  isCatalogButtonShown?: boolean;
  isMegaMenuShown?: boolean;
}

defineProps<IProps>();

const router = useRouter();
const route = useRoute();
const { isAuthenticated } = useUser();
const { logoUrl } = useWhiteLabeling();
const { catalogMenuItems, desktopMainMenuItems } = useNavigations();

const plate = ref<HTMLElement | null>(null);
const catalogMenuElement = shallowRef<HTMLElement | null>(null);
const catalogButton = shallowRef<HTMLElement | null>(null);
const catalogMenuVisible = ref(false);
const { stuck } = useStuckPlate(plate);

const mega = ref<{ $el: HTMLElement } | null>(null);

const { bottom, height: surfaceHeight } = useElementBounding(plate);
const { height: megaHeight } = useElementBounding(computed(() => mega.value?.$el ?? null));

// What the plate paints once pinned: the second row collapses to nothing and the plate keeps
// its flow height as padding (see --stuck below), so the painted height is the surface without
// that row — the same number pinned or not, which is what sticky consumers need.
const pinnedHeight = computed(() => surfaceHeight.value - megaHeight.value);

const catalogButtonIcon = computed<string>(() => (catalogMenuVisible.value ? "chevron-up" : "chevron-down"));
const dropdownStyle = computed<StyleValue | undefined>(() =>
  bottom.value ? { maxHeight: `calc(100vh - ${bottom.value}px)` } : undefined,
);

const catalogLink = router.resolve({ name: "Catalog" }).fullPath;

onClickOutside(
  catalogMenuElement,
  () => {
    catalogMenuVisible.value = false;
  },
  { ignore: [catalogButton] },
);

syncRefs(catalogMenuVisible, useScrollLock(document.body));

async function toggleCatalogDropdown(event: Event) {
  if (!catalogMenuItems.value.length) {
    return;
  }

  event.preventDefault();
  catalogMenuVisible.value = !catalogMenuVisible.value;
  await nextTick();

  if (catalogMenuVisible.value) {
    catalogMenuElement.value?.querySelector("a")?.focus();
  }
}

async function closeCatalogDropdown() {
  catalogMenuVisible.value = false;
  await nextTick();
  catalogButton.value?.focus();
}

function focusoutDropdown(payload: FocusEvent) {
  if (payload.relatedTarget !== catalogButton.value) {
    void closeCatalogDropdown();
  }
}

watch(route, () => {
  catalogMenuVisible.value = false;
});

defineExpose({ pinnedHeight });
</script>

<style lang="scss">
.header-plate {
  $stuck: "";

  // A preset whose header colour equals its canvas hands the glass its own fill.
  --glass: var(--header-plate-glass, var(--header-bottom-bg-color));

  // One handle for both rows of the plate: the logo row lives here, the category row in
  // mega-menu.vue, and two separate numbers would part company on the first edit.
  --header-row-pad-x: 1.5rem;

  // One curve for everything that moves when the plate pins, so the height it gives up and
  // the padding that takes its place cancel out at every frame rather than only at the ends.
  --stick-ease: 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  // .app-header owns stickiness, the page inset and the height vars.
  @apply relative z-[2];

  transition: padding-bottom var(--stick-ease);

  &--stuck {
    $stuck: &;

    --mega-menu-height: 0px;
    --mega-menu-border-color: transparent;

    // The icon row loses its captions and closes up: the labels go to nothing by max-height and
    // max-width, the items give back 2 of their inset, and 4 of gap comes back between what is
    // left — otherwise the bare 24px icons sit almost touching. Set as plain properties because
    // the links are another block's elements; bottom-header-link declares what each one means.
    --header-link-label-max-h: 0px;
    --header-link-label-max-w: 0px;
    --header-link-label-opacity: 0;
    --header-link-pad-x: theme("padding[2.5]");
    --header-links-gap: theme("gap.1");

    // The plate gives its height back to the page ON SCREEN, and keeps every pixel of it
    // in FLOW. Letting the flow height shrink is what made the second row flicker on a
    // slow scroll: a header that gets shorter above the fold makes the document shorter,
    // the browser's scroll anchoring pulls the scroll back to hold the content still, the
    // plate's top crosses back over zero, it un-pins and grows again — and the two states
    // chase each other. Measured before the fix: scrolling to 28 / 32 / 33 landed on
    // 26 / 25 / 25 and the stuck class flipped 1-0-1-0-1; with scroll anchoring switched
    // off by hand the same sweep held every pixel and flipped once.
    //
    // So the plate hands the height to a padding that is air, not surface, and rides the
    // same curve as the rows that are giving it up — the flow height then never moves.
    padding-bottom: 1.5rem;

    // Plus the category row, when the store shows one.
    &:has(.header-plate__mega) {
      padding-bottom: 4rem;
    }
  }

  &__surface {
    // No overflow clipping here: the dropdowns (search suggestions, preferences, account
    // menu) render inside the plate and would be cut off. The collapsing mega row does its
    // own clipping, and every child is transparent, so the rounded corners need none.
    //
    // No outline either — the design separates the plate from the canvas with the shadow
    // alone, and a border over it reads as a second contour. The plate's own edge is the
    // glass pair instead: a sheen inset along the top, a cool line underneath.
    //
    // The surface is where the header stops being air: .app-header drops pointer events so
    // its reserved strip does not cover the page, and the painted plate takes them back.
    @apply pointer-events-auto relative;

    // Its own stacking context, or a neighbouring plate's backdrop-filter drags this one's
    // content into the blur in Safari (WebKit #98538).
    isolation: isolate;
    border-radius: var(--plate-radius, 1.75rem);
    // The one glass surface of the shell: a vertical wash over a blurred backdrop. Three
    // stops, not a flat wash — that is what reads as thickness rather than as a scrim.
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

    // A translucent plate with nothing behind it is a washed-out surface, so where the
    // browser cannot blur, the glass falls back to the solid header colour.
    @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
      background: var(--glass);
    }

    // Flush against the window edge the top corners have nothing to round against, and
    // the plate now hangs over the page — it takes the deeper shadow while it does.
    #{$stuck} & {
      @apply rounded-t-none;

      box-shadow:
        inset 0 1px 0 var(--glass-sheen, color-mix(in srgb, var(--glass) 85%, transparent)),
        inset 0 -1px 0 var(--glass-under, transparent),
        var(--plate-shadow-lift, 0 18px 44px color-mix(in srgb, var(--header-bottom-text-color) 12%, transparent));
    }
  }

  &__row {
    // 88 tall at rest, 64 once pinned: the header gives its height back to the page as
    // soon as it starts covering it. Height and padding ride the same curve, or the row
    // settles in two steps.
    @apply flex items-center gap-5;

    min-height: 5.5rem;
    padding: 0.75rem var(--header-row-pad-x);
    transition:
      min-height var(--stick-ease),
      padding-block var(--stick-ease);

    #{$stuck} & {
      @apply py-2;

      min-height: 4rem;
    }
  }

  &__brand {
    @apply flex-none;

    transition: opacity var(--transition-duration, 0.2s) ease;

    &:hover {
      opacity: 0.72;
    }
  }

  &__logo {
    // Steps down with the row rather than staying put: a 44px logo in a 64px row leaves
    // the pinned header no air at all.
    @apply h-11;

    transition: height var(--stick-ease);

    #{$stuck} & {
      @apply h-[2.125rem];
    }
  }

  &__catalog {
    @apply flex flex-none select-none items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold uppercase tracking-wide;

    color: var(--header-bottom-link-color);
    transition:
      background var(--transition-duration, 0.2s) ease,
      color var(--transition-duration, 0.2s) ease;

    &:hover {
      background: color-mix(in srgb, var(--header-bottom-text-color) 5%, transparent);
      color: var(--header-bottom-link-hover-color);
    }
  }

  &__search {
    @apply min-w-0 flex-1;
  }

  &__links {
    @apply -mx-2 flex flex-none items-center;

    gap: var(--header-links-gap, 0px);
    transition: gap var(--stick-ease);
  }

  &__end {
    // 10, not the 8 the rest of the row uses, and 8 of clear air before it: the pill and the
    // avatar are a pair apart from the icon links, and at an equal gap they read as two more
    // links. The design spends both numbers on exactly that separation.
    @apply flex flex-none items-center gap-2.5 ms-2;
  }

  &__mega {
    @apply overflow-hidden;

    transition: height var(--stick-ease);
  }

  &__dropdown {
    @apply pointer-events-auto absolute inset-x-0 z-[1] overflow-y-auto shadow-md;

    background: var(--header-bottom-bg-color);
    border-radius: var(--vc-radius);
    transition: transform var(--transition-duration, 0.2s) ease;

    &--hidden {
      @apply -translate-y-full;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    --stick-ease: 0s;

    transition: none;
  }
}
</style>
