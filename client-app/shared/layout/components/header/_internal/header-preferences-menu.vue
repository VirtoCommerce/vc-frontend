<template>
  <VcPopover
    class="header-preferences-menu"
    placement="bottom-end"
    :offset-options="10"
    role="dialog"
    :aria-label="$t('shared.layout.header.preferences_menu.aria_label')"
    bg-color="--header-bottom-bg-color"
    shadow
  >
    <template #trigger="{ opened, triggerProps }">
      <button
        type="button"
        class="header-preferences-menu__pill"
        :class="{ 'header-preferences-menu__pill--opened': opened }"
        data-test-id="preferences-menu"
        v-bind="triggerProps"
      >
        <b>{{ currentCurrency?.code }} · {{ currentLanguage.twoLetterLanguageName.toUpperCase() }}</b>

        <VcIcon :name="opened ? 'chevron-up' : 'chevron-down'" size="xxs" />
      </button>
    </template>

    <template #content>
      <div class="header-preferences-menu__panel">
        <div class="header-preferences-menu__column">
          <section v-if="supportedCurrencies.length > 1" class="header-preferences-menu__group">
            <h3 class="header-preferences-menu__title">{{ $t("shared.layout.header.preferences_menu.currency") }}</h3>

            <button
              v-for="currency in supportedCurrencies"
              :key="currency.code"
              type="button"
              class="header-preferences-menu__item"
              :aria-current="currency.code === currentCurrency?.code ? 'true' : undefined"
              @click="selectCurrency(currency.code)"
            >
              <span class="header-preferences-menu__symbol">{{ currency.symbol }}</span>

              <b class="header-preferences-menu__code">{{ currency.code }}</b>

              <span class="header-preferences-menu__name">{{ currency.englishName }}</span>
            </button>
          </section>

          <section v-if="isDarkModeAvailable" class="header-preferences-menu__group">
            <h3 class="header-preferences-menu__title">{{ $t("shared.layout.header.preferences_menu.appearance") }}</h3>

            <VcTabSwitchGroup
              class="header-preferences-menu__modes"
              variant="seg"
              fill
              :aria-label="$t('shared.layout.header.preferences_menu.appearance')"
            >
              <!-- VcTabSwitch does not write to its model — v-model only feeds `checked`, and the
                   consumer commits the new value from @change (see view-mode.vue). -->
              <VcTabSwitch
                v-for="mode in COLOR_MODES"
                :key="mode.value"
                v-model="colorMode"
                name="header-color-mode"
                :value="mode.value"
                :icon="mode.icon"
                :label="$t(`shared.layout.header.preferences_menu.theme.${mode.value}`)"
                size="sm"
                @change="colorMode = $event"
              />
            </VcTabSwitchGroup>
          </section>
        </div>

        <div v-if="supportedLanguages.length > 1" class="header-preferences-menu__column">
          <section class="header-preferences-menu__group">
            <h3 class="header-preferences-menu__title">{{ $t("shared.layout.header.preferences_menu.language") }}</h3>

            <button
              v-for="language in supportedLanguages"
              :key="language.cultureName"
              type="button"
              class="header-preferences-menu__item"
              :aria-current="language.cultureName === currentLanguage.cultureName ? 'true' : undefined"
              :data-culture-name="language.cultureName"
              @click="selectLanguage(language.cultureName)"
            >
              <VcImage
                :src="getFlagIconUrl(getCountryCode(language))"
                :alt="language.nativeName"
                class="header-preferences-menu__flag"
                lazy
              />

              <span>{{ language.nativeName }}</span>
            </button>
          </section>
        </div>
      </div>
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
import { useDarkMode } from "@/core/composables";
import { useLocaleSwitch } from "@/shared/layout/composables";
import { getFlagIconUrl } from "@/ui-kit/utilities";

const COLOR_MODES = [
  { value: "light", icon: "sun" },
  { value: "dark", icon: "moon" },
  { value: "system", icon: "monitor" },
] as const;

const { isDarkModeAvailable, colorMode } = useDarkMode();
const {
  currentCurrency,
  supportedCurrencies,
  currentLanguage,
  supportedLanguages,
  selectCurrency,
  selectLanguage,
  getCountryCode,
} = useLocaleSwitch();
</script>

<style lang="scss">
.header-preferences-menu {
  // The panel may be teleported out of the header, so it paints from the same global
  // theme keys the plate uses rather than inheriting anything.
  --ink: var(--header-bottom-text-color);

  // The panel's own surface, so a selected row can invert straight onto it.
  --surface: var(--header-bottom-bg-color);
  --line: color-mix(in srgb, var(--ink) 12%, transparent);

  &__pill {
    @apply flex flex-none cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-sm;

    border: 1px solid color-mix(in srgb, var(--ink) 16%, transparent);
    background: transparent;
    color: var(--header-bottom-link-color);
    transition:
      background var(--transition-duration) ease,
      border-color var(--transition-duration) ease;

    b {
      @apply font-semibold;

      color: var(--ink);
    }

    &:hover {
      background: color-mix(in srgb, var(--ink) 6%, transparent);
      border-color: color-mix(in srgb, var(--ink) 26%, transparent);
    }

    &--opened {
      background: color-mix(in srgb, var(--ink) 8%, transparent);
      border-color: color-mix(in srgb, var(--ink) 26%, transparent);
    }
  }

  &__panel {
    @apply flex gap-4 p-4;

    // The store decides how many currencies and languages there are — QA serves 9 and 15,
    // which is a panel taller than the window. Each column carries its own scroll.
    max-height: calc(100vh - 7rem);
    color: var(--ink);
  }

  &__column {
    @apply flex min-h-0 flex-col gap-4 overflow-y-auto;
  }

  &__group {
    // Each setting is its own outlined card, as the design draws it, instead of three
    // lists running together down one surface with only their titles to separate them.
    @apply flex flex-col gap-0.5 rounded-[--vc-radius] p-2;

    border: 1px solid var(--line);
  }

  &__title {
    @apply mb-1 px-2 text-xs font-bold uppercase tracking-wide;

    color: color-mix(in srgb, var(--ink) 55%, transparent);
  }

  &__item {
    @apply flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent p-2 text-start text-sm leading-tight;

    border-radius: calc(var(--vc-radius) - 2px);
    color: inherit;
    transition:
      background var(--transition-duration) ease,
      color var(--transition-duration) ease;

    // A tint of the ink, not a palette step: it lands right in both themes, where a fixed
    // light grey would darken the dark panel instead of lifting it.
    &:hover {
      background: color-mix(in srgb, var(--ink) 8%, transparent);
    }

    // The design fills the selected row with the ink and flips its text back to the
    // panel's surface. Naming both ends keeps it correct in dark, where the two swap.
    &[aria-current="true"] {
      background: var(--ink);
      color: var(--surface);
    }
  }

  &__symbol {
    // The column is fixed so the codes line up down the list, and 2rem is what the widest
    // symbol the store can serve needs — QA's GH₵ measures 31px. `truncate` is the backstop:
    // a longer one clips instead of sliding out of the box and over the code next to it.
    @apply w-8 flex-none truncate text-center;

    // Muted against whatever the row is painted with, so the selected row mutes against
    // its own light text rather than disappearing into the ink behind it.
    color: color-mix(in srgb, currentColor 55%, transparent);
  }

  &__code {
    @apply flex-none font-bold;
  }

  &__name {
    // The design sets the English name against the far edge of the card, which is what
    // gives the list its column; `ps-6` is the smallest gap the longest code may keep.
    @apply ms-auto truncate ps-6;

    color: color-mix(in srgb, currentColor 55%, transparent);
  }

  &__modes {
    // The rail itself is VcTabSwitchGroup's seg variant. Only one thing differs from the
    // catalog's rails: here the glyphs stay in the brand colour in every state, selected or
    // not — the design's single exception, because in the catalog the accent is already
    // spoken for by the sort switcher.
    --vc-icon-color: theme("colors.primary.500");
    --vc-tab-switch-color: theme("colors.primary.500");
    --vc-tab-switch-hover-icon-color: theme("colors.primary.500");
  }

  &__flag {
    @apply h-3.5 w-5 flex-none object-cover;
  }
}
</style>
