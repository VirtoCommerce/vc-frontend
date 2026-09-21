<template>
  <div class="header-pill">
    <header ref="bar" class="header-pill__bar">
      <router-link class="header-pill__brand" :to="$context.settings.default_return_url ?? '/'">
        <VcImage :src="logoUrl" :alt="$context.storeName" class="header-pill__logo" lazy />
      </router-link>

      <nav class="header-pill__nav" :aria-label="$t('shared.layout.header.bottom_header.main_menu')">
        <a
          v-if="isMenuShown"
          ref="catalogButton"
          class="header-pill__nav-item"
          :href="catalogLink"
          :aria-label="$t('shared.layout.header.bottom_header.catalog_menu_button')"
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
      </nav>

      <SearchBar class="header-pill__search" />

      <div class="header-pill__utils">
        <ShipToSelector />

        <CurrencySelector
          v-if="!isLoyaltyCatalogRoute && $context.availableCurrencies && $context.availableCurrencies.length > 1"
        />

        <LanguageSelector v-if="$context.availableLanguages && $context.availableLanguages.length > 1" />

        <DarkModeToggle v-if="isDarkModeAvailable" tooltip test-id="dark-mode-toggle" icon-size="sm" />
      </div>

      <ul class="header-pill__pods">
        <li v-for="item in desktopMainMenuItems" :key="item.id" :data-test-id="item.dataTestId">
          <ExtensionPoint category="headerMenu" :name="item.id" :item="item">
            <LinkDefault :item="item" />
          </ExtensionPoint>
        </li>
      </ul>

      <HeaderAccountMenu v-if="isAuthenticated" />

      <VcButton v-else :to="ROUTES.SIGN_IN.PATH" size="sm" data-test-id="sign-in-link">
        {{ $t("shared.layout.header.link_sign_in") }}
      </VcButton>
    </header>

    <transition
      v-if="isMenuShown && catalogMenuItems.length"
      enter-from-class="header-pill__dropdown--hidden"
      leave-to-class="header-pill__dropdown--hidden"
    >
      <div v-if="catalogMenuVisible" ref="catalogMenuElement" class="header-pill__dropdown" :style="dropdownStyle">
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
import { useDarkMode, useNavigations, useWhiteLabeling } from "@/core/composables";
import { ROUTES } from "@/router/routes/constants";
import { useUser } from "@/shared/account/composables/useUser";
import { getCatalogBasePath } from "@/shared/catalog/composables/useCatalogBasePath";
import { CurrencySelector, LanguageSelector } from "@/shared/layout/components";
import { ShipToSelector } from "@/shared/ship-to-location";
import CatalogMenu from "./catalog-menu.vue";
import DarkModeToggle from "./dark-mode-toggle.vue";
import HeaderAccountMenu from "./header-account-menu.vue";
import LinkDefault from "./link-components/link-default.vue";
import SearchBar from "./search-bar/search-bar.vue";
import type { StyleValue } from "vue";

interface IProps {
  isMenuShown?: boolean;
}

defineProps<IProps>();

const router = useRouter();
const route = useRoute();
const { isAuthenticated } = useUser();
const { logoUrl } = useWhiteLabeling();
const { isDarkModeAvailable } = useDarkMode();
const { catalogMenuItems, desktopMainMenuItems } = useNavigations();

const bar = ref<HTMLElement | null>(null);
const catalogMenuElement = shallowRef<HTMLElement | null>(null);
const catalogButton = shallowRef<HTMLElement | null>(null);
const catalogMenuVisible = ref(false);

const { bottom } = useElementBounding(bar);

const isLoyaltyCatalogRoute = computed(() => getCatalogBasePath(route.path) === ROUTES.LOYALTY_CATALOG.PATH);
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
</script>

<style lang="scss">
.header-pill {
  --glass: var(--header-bottom-bg-color);

  // Stickiness and the page inset belong to .app-header, which also owns the height vars.
  // The stacking context is ours though: the search suggestions overlay has to paint
  // above the mega menu plate that follows us in the shell.
  @apply relative z-[2];

  &__bar {
    @apply flex items-center gap-3.5 rounded-full border;

    padding: 0.625rem 0.625rem 0.625rem 1.25rem;
    border-color: color-mix(in srgb, var(--header-bottom-text-color) 10%, transparent);
    // The one glass surface in the theme: a vertical wash over a blurred backdrop.
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--glass) 94%, transparent),
      color-mix(in srgb, var(--glass) 82%, transparent) 58%,
      color-mix(in srgb, var(--glass) 86%, transparent)
    );
    backdrop-filter: saturate(190%) blur(22px);
    box-shadow:
      inset 0 1px 0 color-mix(in srgb, var(--glass) 85%, transparent),
      0 10px 34px color-mix(in srgb, var(--header-bottom-text-color) 10%, transparent);
    color: var(--header-bottom-text-color);
  }

  &__brand {
    @apply flex-none;

    transition: opacity var(--transition-duration) ease;

    &:hover {
      opacity: 0.72;
    }
  }

  &__logo {
    @apply h-8;
  }

  &__nav {
    @apply flex flex-none gap-0.5;
  }

  &__nav-item {
    @apply flex select-none items-center gap-2 rounded-full px-3.5 py-2 text-sm;

    color: var(--header-bottom-link-color);
    transition:
      background var(--transition-duration) ease,
      color var(--transition-duration) ease;

    &:hover {
      background: color-mix(in srgb, var(--header-bottom-text-color) 5%, transparent);
      color: var(--header-bottom-link-hover-color);
    }
  }

  &__search {
    @apply min-w-0 flex-1;
  }

  &__utils {
    @apply flex flex-none items-center gap-3;

    // Ship-to, currency and language were built for the dark top strip and paint
    // themselves with --header-top-*. Inside the light pill they have to read against
    // the bottom-header surface, so remap the four keys locally.
    --header-top-text-color: var(--header-bottom-text-color);
    --header-top-link-color: var(--header-bottom-link-color);
    --header-top-link-hover-color: var(--header-bottom-link-hover-color);
    --header-top-link-active-color: var(--header-bottom-link-active-color);
  }

  &__pods {
    @apply flex flex-none items-center gap-1.5;
  }

  &__dropdown {
    @apply absolute inset-x-0 z-[1] overflow-y-auto shadow-md;

    background: var(--header-bottom-bg-color);
    border-radius: var(--vc-radius);
    transition: transform var(--transition-duration) ease;

    &--hidden {
      @apply -translate-y-full;
    }
  }
}
</style>
