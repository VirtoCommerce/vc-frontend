<template>
  <div
    class="relative bg-[--header-bottom-bg-color] text-[--header-bottom-text-color]"
    v-bind="getPreviewSectionAttrs(siteHeader?.id)"
  >
    <nav
      ref="bottomHeader"
      class="relative z-[2] flex min-h-[5.5rem] items-center gap-x-5 bg-inherit px-5 py-3 xl:px-12"
      :aria-label="$t('shared.layout.header.bottom_header.main_menu')"
    >
      <router-link :to="$context.settings.default_return_url ?? '/'" :style="logoStyle">
        <VcImage
          :src="headerLogoUrl"
          :alt="$context.storeName"
          :class="logoWidth ? 'h-auto w-[--header-logo-width]' : 'h-8 xl:h-[2.8rem]'"
          lazy
        />
      </router-link>

      <template v-if="organization">
        <div class="hidden h-6 w-0.5 bg-primary xl:block"></div>

        <div class="hidden max-w-36 text-base italic leading-[18px] text-neutral-800 xl:line-clamp-2">
          {{ organization?.name }}
        </div>
      </template>

      <!-- Catalog button -->
      <a
        v-if="isMenuShown"
        ref="showCatalogMenuButton"
        :href="catalogLink"
        type="button"
        class="flex select-none items-center rounded border-2 border-primary px-[0.8rem] py-[0.55rem] text-sm text-[--header-bottom-link-color] hover:text-[--header-bottom-link-hover-color]"
        :aria-label="$t('shared.layout.header.bottom_header.catalog_menu_button')"
        aria-haspopup="menu"
        @click="toggleCatalogDropdown"
        @keydown.enter="toggleCatalogDropdown"
        @keydown.space="toggleCatalogDropdown"
        @keydown.esc="closeCatalogDropdown"
      >
        <span class="font-bold uppercase tracking-wide">
          {{ $t("shared.layout.header.bottom_header.catalog_menu_button") }}
        </span>

        <VcIcon v-if="catalogMenuItems.length" :name="catalogButtonIcon" size="xs" class="ml-3 text-primary" />
      </a>

      <SearchBar />

      <ul class="-mx-2 flex items-center">
        <li v-for="item in iconsMenuItems" :key="item.id" :data-test-id="item.dataTestId">
          <ExtensionPoint category="headerMenu" :name="item.id" :item="item">
            <LinkDefault :item="item" />
          </ExtensionPoint>
        </li>
      </ul>
    </nav>

    <!-- Catalog dropdown -->
    <transition
      v-if="isMenuShown && catalogMenuItems.length"
      enter-from-class="-translate-y-full"
      leave-to-class="-translate-y-full"
      enter-active-class="will-change-transform"
      leave-active-class="will-change-transform"
    >
      <div
        v-if="catalogMenuVisible"
        ref="catalogMenuElement"
        class="absolute w-full overflow-y-auto bg-inherit shadow-md transition-transform duration-200"
        :style="catalogMenuStyle"
      >
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
import { computed, nextTick, onDeactivated, ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useNavigations } from "@/core/composables";
import { useUser } from "@/shared/account/composables/useUser";
import { useHeaderLogo } from "@/shared/layout/composables/useHeaderLogo";
import { useThemeChrome } from "@/shared/layout/composables/useThemeChrome";
import { getPreviewSectionAttrs } from "@/shared/static-content/sections";
import CatalogMenu from "./catalog-menu.vue";
import SearchBar from "./search-bar/search-bar.vue";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { StyleValue } from "vue";
import LinkDefault from "@/shared/layout/components/header/_internal/link-components/link-default.vue";

interface IProps {
  isMenuShown?: boolean;
}

defineProps<IProps>();

const router = useRouter();
const { organization } = useUser();
const { headerLogoUrl } = useHeaderLogo();
const { logoWidth, logoStyle, iconsMenuLinks, siteHeader } = useThemeChrome();
const { catalogMenuItems, desktopMainMenuItems } = useNavigations();

const iconsMenuItems = computed<ExtendedMenuLinkType[]>(() =>
  iconsMenuLinks.value
    ? iconsMenuLinks.value.map((link) => {
        const routeName = typeof link.route === "string" ? router.resolve(link.route).name : undefined;
        const builtIn = desktopMainMenuItems.value.find(
          (item) => typeof item.route === "object" && "name" in item.route && item.route.name === routeName,
        );
        return builtIn
          ? { ...builtIn, title: link.title }
          : { ...link, id: typeof link.route === "string" ? link.route : link.title };
      })
    : desktopMainMenuItems.value,
);

const bottomHeader = ref<HTMLElement | null>(null);
const catalogMenuElement = shallowRef<HTMLElement | null>(null);
const showCatalogMenuButton = shallowRef<HTMLElement | null>(null);
const catalogMenuVisible = ref(false);

const { bottom } = useElementBounding(bottomHeader);
const route = useRoute();

const catalogButtonIcon = computed<string>(() => (catalogMenuVisible.value ? "chevron-up" : "chevron-down"));
const catalogMenuStyle = computed<StyleValue | undefined>(() =>
  bottom.value ? { maxHeight: `calc(100vh - ${bottom.value}px)` } : undefined,
);

const catalogLink = router.resolve({ name: "Catalog" }).fullPath;

onClickOutside(
  catalogMenuElement,
  () => {
    catalogMenuVisible.value = false;
  },
  { ignore: [showCatalogMenuButton] },
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
  showCatalogMenuButton.value?.focus();
}

function focusoutDropdown(payload: FocusEvent) {
  if (payload.relatedTarget !== showCatalogMenuButton.value) {
    void closeCatalogDropdown();
  }
}

watch(route, () => {
  catalogMenuVisible.value = false;
});

// A header kept alive under a page without it must not leave its menu open or the page unable to scroll.
onDeactivated(() => {
  catalogMenuVisible.value = false;
});
</script>
