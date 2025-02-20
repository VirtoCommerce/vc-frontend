<template>
  <div class="relative bg-[--header-bottom-bg-color] text-[--header-bottom-text-color]">
    <nav
      ref="bottomHeader"
      class="relative z-[2] flex min-h-[5.5rem] items-center gap-x-5 bg-inherit px-5 py-3 xl:px-12"
    >
      <router-link :to="$context.settings.default_return_url ?? '/'">
        <VcImage :src="logoUrl" :alt="$context.storeName" class="h-8 xl:h-[2.8rem]" lazy />
      </router-link>

      <template v-if="organization">
        <div class="hidden h-6 w-0.5 bg-primary xl:block"></div>

        <div class="hidden max-w-36 text-base italic leading-[18px] text-neutral-800 xl:line-clamp-2">
          {{ organization?.name }}
        </div>
      </template>

      <!-- Catalog button -->
      <a
        ref="showCatalogMenuButton"
        :href="catalogLink"
        type="button"
        class="flex select-none items-center rounded border-2 border-primary px-[0.8rem] py-[0.55rem] text-sm text-[--header-bottom-link-color] hover:text-[--header-bottom-link-hover-color]"
        @click="toggleCatalogDropdown"
        @keydown.enter="toggleCatalogDropdown"
        @keydown.space="toggleCatalogDropdown"
        @keydown.esc="closeCatalogDropdown"
      >
        <span class="font-bold uppercase tracking-wide">
          {{ $t("shared.layout.header.bottom_header.catalog_menu_button") }}
        </span>

        <VcIcon v-if="catalogMenuItems.length" :name="catalogButtonIcon" size="xs" class="ml-3 fill-primary" />
      </a>

      <SearchBar />

      <ul class="-mx-2 flex items-center">
        <li v-for="item in desktopMainMenuItems" :key="item.id">
          <component :is="(item.id && customLinkComponents[item.id]) || LinkDefault" :item="item" />
        </li>
      </ul>
    </nav>

    <!-- Catalog dropdown -->
    <transition
      v-if="catalogMenuItems.length"
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
        <CatalogMenu :items="catalogMenuItems" @close="closeCatalogDropdown" @select="closeCatalogDropdown" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside, syncRefs, useElementBounding, useScrollLock } from "@vueuse/core";
import { computed, nextTick, ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useNavigations, useWhiteLabeling } from "@/core/composables";
import { useUser } from "@/shared/account/composables/useUser";
import { SearchBar } from "@/shared/layout";
import { useCustomHeaderLinkComponents } from "@/shared/layout/composables/useCustomHeaderLinkComponents";
import CatalogMenu from "./catalog-menu.vue";
import type { StyleValue } from "vue";
import LinkDefault from "@/shared/layout/components/header/_internal/link-components/link-default.vue";

const router = useRouter();
const { organization } = useUser();
const { logoUrl } = useWhiteLabeling();
const { catalogMenuItems, desktopMainMenuItems } = useNavigations();
const { customLinkComponents } = useCustomHeaderLinkComponents();

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

// TODO: Redirect to localized catalog path if catalogMenuItems has not items
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

watch(route, () => {
  catalogMenuVisible.value = false;
});
</script>
