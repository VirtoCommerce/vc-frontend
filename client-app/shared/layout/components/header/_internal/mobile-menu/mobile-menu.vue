<template>
  <div class="mobile-menu">
    <div
      class="mobile-menu__overlay"
      role="button"
      tabindex="0"
      :aria-label="$t('common.buttons.close')"
      @click="$emit('close')"
      @keypress="$emit('close')"
    />

    <nav class="mobile-menu__panel">
      <div class="mobile-menu__head">
        <div class="mobile-menu__brand">
          <span v-if="organization" class="mobile-menu__org">
            {{ organization?.name }}
          </span>

          <VcImage v-else :src="$cfg.logo_inverted_image" :alt="$context.storeName" class="mobile-menu__logo" lazy />
        </div>

        <!-- Dark mode toggle -->
        <DarkModeToggle
          :tooltip="false"
          :icon-size="22"
          test-id="mobile-dark-mode-toggle"
          class="mobile-menu__control"
        />

        <!-- Language block -->
        <LanguageSelector v-if="supportedLanguages.length > 1" />

        <button
          type="button"
          class="mobile-menu__control"
          :aria-label="$t('common.buttons.close')"
          @click="$emit('close')"
        >
          <VcIcon name="delete-thin" :size="22" />
        </button>
      </div>

      <section v-if="openedItem" class="mobile-menu__body">
        <div class="mobile-menu__drill">
          <button type="button" class="mobile-menu__back" :aria-label="$t('common.buttons.back')" @click="goBack">
            <VcIcon name="arrow-left" :size="22" />
          </button>

          <h2 v-if="openedItem?.title" class="mobile-menu__title">
            {{ openedItem?.title }}
          </h2>

          <MultiOrganisationMenu v-if="openedItem.id === 'contact-organizations'" />

          <SettingsMenu v-else-if="openedItem.id === 'settings'" />

          <DefaultMenu v-else :items="sortedFilteredChildren" @close="$emit('close')" @select-item="selectMenuItem" />

          <!-- view all catalog link -->
          <template v-if="openedItem?.isCatalogItem && openedItem?.route">
            <div class="mobile-menu__divider"></div>

            <a
              v-if="isExternalLink(openedItem.route)"
              class="mobile-menu__view-all"
              :href="openedItem.route as string"
              target="_blank"
              rel="noopener noreferrer"
              @click="$emit('close')"
            >
              {{ $t("shared.layout.header.mobile.view_all_catalog") }}
            </a>

            <router-link v-else class="mobile-menu__view-all" :to="openedItem.route" @click="$emit('close')">
              {{ $t("shared.layout.header.mobile.view_all_catalog") }}
            </router-link>
          </template>
        </div>
      </section>

      <MainMenu v-else :menu-item="homeMenuItem" @close="$emit('close')" @select-item="selectMenuItem" />
    </nav>
  </div>
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
import DarkModeToggle from "@/shared/layout/components/header/_internal/dark-mode-toggle.vue";
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

const { supportedLanguages } = useLanguages();
const { isAuthenticated, organization, isCorporateMember, isMultiOrganization } = useUser();
const { mobilePreSelectedMenuItem } = useNavigations();
const homeMenuItem = computed<ExtendedMenuLinkType>(() =>
  isAuthenticated.value
    ? {
        route: { name: "Dashboard" },
        title: t("shared.layout.header.mobile.account_menu.dashboard"),
        icon: "view-grid",
      }
    : {
        route: "/",
        title: t("shared.layout.header.menu.home"),
        icon: "dashboard-2",
      },
);

function isExternalLink(link?: RouteLocationRaw) {
  return "externalLink" in getLinkAttr(link);
}

const openedMenuItemsStack = shallowRef<ExtendedMenuLinkType[]>([]);

const openedItem = computed<ExtendedMenuLinkType | undefined>(
  () => openedMenuItemsStack.value[openedMenuItemsStack.value.length - 1],
);

const sortedFilteredChildren = computed(() => {
  const sortedChildren = (openedItem.value?.children || [])
    .slice()
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  return sortedChildren.filter(canShowItem);
});

function canShowItem(item: ExtendedMenuLinkType) {
  if (item.id === "addresses" && isCorporateMember.value) {
    return false;
  }
  return !(item.id === "contact-organizations" && !isMultiOrganization.value);
}

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

<style lang="scss">
.mobile-menu {
  // The design floats the menu instead of filling the screen: a dark plate standing off every
  // edge of the window, over a blurred page. The inset is the plate's own, not the page's
  // gutter — the menu hangs over the page rather than sitting in its column, and at the page's
  // 12px phone gutter it would read as a full-screen panel with rounded corners.
  --mobile-menu-inset: 1.25rem;

  @apply fixed inset-0 z-50;

  &__overlay {
    @apply absolute inset-0 cursor-pointer;

    background: rgb(from theme("colors.neutral.950") r g b / 0.32);
    backdrop-filter: blur(6px);
  }

  &__panel {
    @apply absolute flex flex-col overflow-hidden;

    // Logical, so the panel opens from the reading edge in RTL as it does in LTR. The safe-area
    // insets are added, not substituted: on a notched phone the plate must clear the notch AND
    // keep its own inset, or it reads as glued to the status bar.
    inset-block: calc(var(--mobile-menu-inset) + env(safe-area-inset-top, 0px))
      calc(var(--mobile-menu-inset) + env(safe-area-inset-bottom, 0px));
    inset-inline: var(--mobile-menu-inset);
    border-radius: var(--plate-radius, 1.75rem);
    background: rgb(from var(--mobile-menu-bg-color) r g b / 0.94);
    backdrop-filter: blur(28px) saturate(135%);
    border: 1px solid rgb(from var(--mobile-menu-text-color) r g b / 0.09);
    box-shadow:
      inset 0 1px 0 rgb(from var(--mobile-menu-text-color) r g b / 0.12),
      var(--plate-shadow-lift, 0 18px 44px rgb(0 0 0 / 0.3));
    color: var(--mobile-menu-text-color);

    // Where the browser cannot blur, a 94% plate over a page is mud — it goes solid instead.
    @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
      background: var(--mobile-menu-bg-color);
    }

    // Past the phone the plate stops stretching and stays a drawer against the reading edge.
    @media (min-width: theme("screens.md")) {
      inset-inline-end: auto;
      inline-size: 26.875rem;
      max-inline-size: calc(100% - 2 * var(--mobile-menu-inset));
    }
  }

  &__head {
    @apply flex h-16 shrink-0 items-center gap-1 pe-3 ps-6;
  }

  &__brand {
    @apply min-w-0 grow pe-1;
  }

  &__org {
    @apply line-clamp-2 text-xl italic leading-[22px] [word-break:break-word];
  }

  &__logo {
    @apply max-h-9;
  }

  &__control {
    @apply appearance-none p-2;

    color: var(--mobile-menu-navigation-color);
  }

  &__body {
    @apply grow overflow-y-auto;
  }

  &__drill {
    @apply flex flex-col px-6 pb-6 pt-4;
  }

  // A filled disc rather than an outlined glyph: it is the only way back out of a drilled-in
  // list, and at the top of a dark plate an outline of it disappears.
  &__back {
    @apply flex size-10 shrink-0 appearance-none items-center justify-center self-start rounded-full;

    background: var(--mobile-menu-control-color);
    color: theme("colors.additional.50");
  }

  &__title {
    @apply mb-0 mt-5 text-xs font-bold uppercase tracking-[0.14em];

    // The design's "muted" ink: the menu's own text at 55%. Not a preset token — nothing but
    // this caption needs it, and a knob no theme sets is a knob that drifts.
    color: rgb(from var(--mobile-menu-text-color) r g b / 0.55);
  }

  &__divider {
    @apply my-5 h-px;

    background: linear-gradient(to right, var(--mobile-menu-control-color), transparent);
  }

  &__view-all {
    @apply text-[0.9375rem] font-semibold tracking-[0.01em];

    color: var(--mobile-menu-link-active-color);
  }
}

// Enters from the trigger, leaves the way it came. Both the plate and the page behind it move
// together, or the blur lands before the menu does.
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  .mobile-menu__panel {
    transition:
      opacity 0.22s ease,
      transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .mobile-menu__overlay {
    transition: opacity 0.22s ease;
  }
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  .mobile-menu__panel {
    @apply opacity-0;

    transform: translateY(-8px) scale(0.985);
  }

  .mobile-menu__overlay {
    @apply opacity-0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mobile-menu-enter-active,
  .mobile-menu-leave-active {
    .mobile-menu__panel,
    .mobile-menu__overlay {
      transition: none;
    }
  }
}
</style>
