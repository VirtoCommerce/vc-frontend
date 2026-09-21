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
          <HeaderLocalePill />

          <HeaderAccountMenu v-if="isAuthenticated" />

          <VcButton v-else :to="ROUTES.SIGN_IN.PATH" size="sm" data-test-id="sign-in-link">
            {{ $t("shared.layout.header.link_sign_in") }}
          </VcButton>
        </div>
      </nav>

      <!-- Second row of the same plate. It collapses to zero height once the plate sticks,
           so a scrolled page keeps a single-row header. -->
      <MegaMenu v-if="isMegaMenuShown" class="header-plate__mega" />
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
import { onClickOutside, syncRefs, useElementBounding, useEventListener, useScrollLock } from "@vueuse/core";
import { computed, nextTick, ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useNavigations, useWhiteLabeling } from "@/core/composables";
import { ROUTES } from "@/router/routes/constants";
import { useUser } from "@/shared/account/composables/useUser";
import CatalogMenu from "./catalog-menu.vue";
import HeaderAccountMenu from "./header-account-menu.vue";
import HeaderLocalePill from "./header-locale-pill.vue";
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
const stuck = ref(false);

const { bottom } = useElementBounding(plate);

const catalogButtonIcon = computed<string>(() => (catalogMenuVisible.value ? "chevron-up" : "chevron-down"));
const dropdownStyle = computed<StyleValue | undefined>(() =>
  bottom.value ? { maxHeight: `calc(100vh - ${bottom.value}px)` } : undefined,
);

const catalogLink = router.resolve({ name: "Catalog" }).fullPath;

// Read from geometry rather than scrollY: that stays correct through anchor jumps,
// resizes, and pages that do not start at zero. Capture phase, because the scroll
// may happen on an inner container rather than on window.
function updateStuck() {
  const element = plate.value;

  if (element) {
    stuck.value = element.getBoundingClientRect().top <= 0.5;
  }
}

useEventListener("scroll", updateStuck, { passive: true, capture: true });
useEventListener("resize", updateStuck);
watch(plate, updateStuck, { flush: "post" });

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
.header-plate {
  $stuck: "";

  --glass: var(--header-bottom-bg-color);

  // .app-header owns stickiness, the page inset and the height vars.
  @apply relative z-[2];

  &--stuck {
    $stuck: &;
  }

  &__surface {
    @apply overflow-hidden rounded-[1.75rem] border;

    border-color: color-mix(in srgb, var(--header-bottom-text-color) 10%, transparent);
    // The one glass surface of the shell: a vertical wash over a blurred backdrop.
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
    transition: border-radius var(--transition-duration) ease;

    // Flush against the window edge the top corners have nothing to round against.
    #{$stuck} & {
      @apply rounded-t-none;
    }
  }

  &__row {
    @apply flex items-center gap-3.5 px-5 py-2.5;
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

  &__catalog {
    @apply flex flex-none select-none items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold uppercase tracking-wide;

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

  &__links {
    @apply -mx-2 flex flex-none items-center;
  }

  &__end {
    @apply flex flex-none items-center gap-2;
  }

  &__mega {
    @apply overflow-hidden transition-[height] duration-200;

    #{$stuck} & {
      @apply h-0;
    }
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
