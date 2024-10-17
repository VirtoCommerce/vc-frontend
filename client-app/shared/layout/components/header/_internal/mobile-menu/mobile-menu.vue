<template>
  <nav
    class="mobile-menu fixed z-50 flex size-full flex-col bg-[--mobile-menu-bg-color] text-[--mobile-menu-text-color]"
  >
    <header class="flex h-16 shrink-0 items-center gap-x-3 px-6">
      <div class="grow pr-6">
        <span v-if="organization" class="line-clamp-2 text-xl italic leading-[22px] text-[--mobile-menu-text-color]">
          {{ organization?.name }}
        </span>

        <VcImage v-else :src="$cfg.logo_inverted_image" :alt="$context.storeName" class="max-h-9" lazy />
      </div>

      <!-- Language block -->
      <LanguageSelector v-if="supportedLocales.length > 1" />

      <button type="button" class="-mr-4 appearance-none p-4" @click="$emit('close')">
        <VcIcon name="delete-thin" class="text-[--mobile-menu-navigation-color]" :size="22" />
      </button>
    </header>

    <section v-if="openedItem" class="grow divide-y divide-additional-50 divide-opacity-20 overflow-y-auto">
      <div class="flex flex-col px-10 py-6">
        <button type="button" class="appearance-none self-start text-[--mobile-menu-navigation-color]" @click="goBack">
          <VcIcon name="arrow-circle-left" size="lg" />
        </button>

        <h2 v-if="openedItem?.title" class="mt-5 text-2xl uppercase tracking-[0.01em] text-additional-50">
          {{ openedItem?.title }}
        </h2>

        <MultiOrganisationMenu v-if="openedItem.id === 'contact-organizations'" />
        <SettingsMenu v-else-if="openedItem.id === 'settings'" />
        <DefaultMenu v-else :items="sortedChildren" @close="$emit('close')" @select-item="selectMenuItem" />
        <!-- view all catalog link -->
        <template v-if="openedItem?.isCatalogItem && openedItem?.route">
          <div class="my-5 h-px bg-gradient-to-r from-accent to-transparent"></div>

          <a
            v-if="isExternalLink(openedItem.route)"
            class="view-all-link"
            :href="openedItem.route as string"
            target="_blank"
            @click="$emit('close')"
          >
            {{ $t("shared.layout.header.mobile.view_all_catalog") }}
          </a>
          <router-link v-else class="view-all-link" :to="openedItem.route" @click="$emit('close')">
            {{ $t("shared.layout.header.mobile.view_all_catalog") }}
          </router-link>
        </template>
      </div>
    </section>

    <MainMenu v-else :menu-item="homeMenuItem" @close="$emit('close')" @select-item="selectMenuItem" />

    <div
      class="mobile-menu__overlay fixed inset-y-0 right-0 hidden bg-additional-950/5 backdrop-blur-lg md:block"
      @click="$emit('close')"
    />
  </nav>
</template>

<script setup lang="ts">
import { computed, onMounted, shallowRef, triggerRef } from "vue";
import { useI18n } from "vue-i18n";
import { useNavigations } from "@/core/composables";
import { useLanguages } from "@/core/composables/useLanguages";
import { getLinkAttr } from "@/core/utilities";
import { useUser } from "@/shared/account";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { RouteLocationRaw } from "vue-router";
import DefaultMenu from "@/shared/layout/components/header/_internal/mobile-menu/menus/default-menu.vue";
import MainMenu from "@/shared/layout/components/header/_internal/mobile-menu/menus/main-menu.vue";
import MultiOrganisationMenu from "@/shared/layout/components/header/_internal/mobile-menu/menus/multi-organisation-menu.vue";
import SettingsMenu from "@/shared/layout/components/header/_internal/mobile-menu/menus/settings-menu.vue";
import LanguageSelector from "@/shared/layout/components/language-selector/language-selector.vue";

interface IEmits {
  (event: "close"): void;
}

defineEmits<IEmits>();

const { t } = useI18n();

const { supportedLocales } = useLanguages();
const { isAuthenticated, organization } = useUser();
const { mobilePreSelectedMenuItem } = useNavigations();
const homeMenuItem = computed<ExtendedMenuLinkType>(() =>
  isAuthenticated.value
    ? {
        route: { name: "Dashboard" },
        title: t("shared.layout.header.mobile.account_menu.dashboard"),
        icon: "/static/images/dashboard/icons/dashboard-main.svg#main",
      }
    : {
        route: "/",
        title: t("shared.layout.header.menu.home"),
        icon: "/static/images/dashboard/icons/dashboard.svg#main",
      },
);

function isExternalLink(link?: RouteLocationRaw) {
  return "externalLink" in getLinkAttr(link);
}

const openedMenuItemsStack = shallowRef<ExtendedMenuLinkType[]>([]);

const openedItem = computed<ExtendedMenuLinkType | undefined>(
  () => openedMenuItemsStack.value[openedMenuItemsStack.value.length - 1],
);

const sortedChildren = computed(() => {
  return (openedItem.value?.children || []).slice().sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
});

function goBack() {
  openedMenuItemsStack.value.pop();
  triggerRef(openedMenuItemsStack);
}

function goMainMenu() {
  openedMenuItemsStack.value = [];
  triggerRef(openedMenuItemsStack);
}

function selectMenuItem(item: ExtendedMenuLinkType) {
  if (!item.children) {
    return;
  }
  openedMenuItemsStack.value.push(item);
  triggerRef(openedMenuItemsStack);
}

onMounted(() => {
  goMainMenu();

  if (mobilePreSelectedMenuItem.value) {
    selectMenuItem(mobilePreSelectedMenuItem.value);
  }
});
</script>

<style lang="scss" scoped>
.mobile-menu {
  --sidebar-max-width: 430px;
  --vc-radio-button-base-color: var(--mobile-menu-control-color);

  box-shadow: 5px 0 15px 0 rgba(0, 0, 0, 0.5);

  @apply md:max-w-[var(--sidebar-max-width)];
}

.view-all-link {
  @apply text-lg tracking-[0.01em] text-additional-50;
}

.mobile-menu__overlay {
  @apply left-[var(--sidebar-max-width)];
}

.is-visible .mobile-menu__overlay {
  animation: fadeIn 0.4s forwards;
}

@keyframes fadeIn {
  from {
    @apply opacity-0;
  }
  to {
    @apply opacity-100;
  }
}
</style>
