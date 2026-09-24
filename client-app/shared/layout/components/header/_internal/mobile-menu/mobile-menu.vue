<template>
  <div class="mobile-menu">
    <!-- A dimmer, not a control: it sits before the panel in the DOM, so as a focusable button it
         would be the first stop of every Tab into an open menu. The panel's own ✕ and Escape are
         the keyboard routes out. -->
    <div class="mobile-menu__overlay" aria-hidden="true" @click="$emit('close')" />

    <!-- role + label, but no `aria-modal`: that would promise AT the page behind is inert, and
         nothing traps Tab there yet. -->
    <nav ref="panel" class="mobile-menu__panel" tabindex="-1" role="dialog" :aria-label="$t('common.labels.main_menu')">
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
import { onKeyStroke } from "@vueuse/core";
import { computed, onMounted, shallowRef, triggerRef, useTemplateRef } from "vue";
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

const emit = defineEmits<IEmits>();

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

const panel = useTemplateRef<HTMLElement>("panel");

// The menu is a plate over a dimmed page, so it answers Escape. Not `.stop` — that breaks the
// next dialog up the stack — and not unconditional either: the locale popover inside the menu
// closes on KEYUP, and a keydown that unmounted the menu first would take the open dropdown down
// with it. While such a layer is open its trigger carries aria-expanded, so the key is its.
onKeyStroke("Escape", (event) => {
  if ((event.target as HTMLElement | null)?.closest?.('[aria-expanded="true"]')) {
    return;
  }

  emit("close");
});

onMounted(() => {
  goMainMenu();

  if (mobilePreSelectedMenuItem.value) {
    selectMenuItem(mobilePreSelectedMenuItem.value);
  }

  panel.value?.focus();
});
</script>

<style lang="scss">
.mobile-menu {
  // The plate's own inset, not the page gutter: at the phone's 12px the menu would read as a
  // full-screen panel with rounded corners.
  --mobile-menu-inset: 1.25rem;

  // Kit tokens the plate is expected to set: the radios' ink and the count badge's pair.
  --vc-radio-button-base-color: var(--mobile-menu-control-color);
  --vc-badge-soft-neutral-bg: rgb(from var(--mobile-menu-text-color) r g b / 0.12);
  --vc-badge-soft-neutral-text: var(--mobile-menu-text-color);

  @apply fixed inset-0 z-50;

  &__overlay {
    @apply absolute inset-0 cursor-pointer;

    // Off the MENU's own surface, not off neutral-950: that step is the dark end in light presets
    // and the LIGHT end in dark ones, so the design's literal would brighten the page it is meant
    // to dim. The menu plate is dark in every preset, which is exactly what a scrim wants.
    background: rgb(from var(--mobile-menu-bg-color) r g b / 0.32);
    backdrop-filter: blur(6px);
  }

  &__panel {
    @apply absolute flex flex-col overflow-hidden;

    // Safe-area insets are ADDED to the plate's own, not substituted for it.
    inset-block: calc(var(--mobile-menu-inset) + env(safe-area-inset-top, 0px))
      calc(var(--mobile-menu-inset) + env(safe-area-inset-bottom, 0px));
    inset-inline: calc(var(--mobile-menu-inset) + env(safe-area-inset-left, 0px))
      calc(var(--mobile-menu-inset) + env(safe-area-inset-right, 0px));
    border-radius: var(--plate-radius, 1.75rem);
    background: rgb(from var(--mobile-menu-bg-color) r g b / 0.94);
    backdrop-filter: blur(28px) saturate(135%);
    border: 1px solid rgb(from var(--mobile-menu-text-color) r g b / 0.09);
    box-shadow:
      inset 0 1px 0 rgb(from var(--mobile-menu-text-color) r g b / 0.12),
      var(--plate-shadow-lift, 0 18px 44px rgb(0 0 0 / 0.3));
    color: var(--mobile-menu-text-color);

    // Where the browser cannot blur, a 94% plate over a page is mud — it goes solid.
    @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
      background: var(--mobile-menu-bg-color);
    }

    // The panel takes focus on open so the keyboard starts inside the dialog, and it is
    // `tabindex="-1"` — nothing can tab TO it, so the app's focus ring would mark a thing no one
    // can act on. `outline: none`, not `outline-none`: the utility paints a TRANSPARENT 2px
    // outline, which forced-colors mode repaints as a visible system ring.
    &:focus {
      outline: none;
    }

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

  &__back {
    @apply flex size-10 shrink-0 appearance-none items-center justify-center self-start rounded-full;

    background: var(--mobile-menu-control-color);
    color: theme("colors.additional.50");
  }

  &__title {
    @apply mb-0 mt-5 text-xs font-bold uppercase tracking-[0.14em];

    // The design's muted ink: the menu's own text at 55%.
    color: rgb(from var(--mobile-menu-text-color) r g b / 0.55);
  }

  &__divider {
    @apply my-5 h-px;

    background: linear-gradient(to right, theme("colors.accent.500"), transparent);
  }

  &__view-all {
    @apply text-[0.9375rem] font-semibold tracking-[0.01em];

    color: var(--mobile-menu-link-active-color);
  }
}

// The fade is declared on the ROOT, not only on the plate inside it: Vue reads the transitioned
// element's own computed duration to decide how long to keep the enter/leave classes, and a root
// with no transition resolves in one frame — measured, the classes came and went within 16ms and
// nothing animated. With the root timed, they hold for the full 223ms and the plate's lift rides
// along.
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  // On the ROOT, because Vue reads the transitioned element's own duration to decide how long to
  // keep the enter/leave classes — with no transition here they came and went inside one frame
  // (measured: 16ms) and nothing animated.
  transition: opacity 0.22s ease;

  .mobile-menu__overlay {
    transition: opacity 0.22s ease;
  }

  .mobile-menu__panel {
    transition:
      opacity 0.22s ease,
      transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  }
}

// The fade stays on the two painted children: an ancestor at opacity < 1 is a backdrop root, and
// a `backdrop-filter` inside one samples the group instead of the page — both blurs would be gone
// for the whole animation and snap in at the end. The root keeps only the timing.
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  .mobile-menu__overlay {
    @apply opacity-0;
  }

  .mobile-menu__panel {
    @apply opacity-0;

    transform: translateY(-8px) scale(0.985);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mobile-menu-enter-active,
  .mobile-menu-leave-active {
    transition: none;

    .mobile-menu__overlay,
    .mobile-menu__panel {
      transition: none;
    }
  }
}
</style>
