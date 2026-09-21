<template>
  <VcPopover
    class="header-locale"
    placement="bottom-end"
    :offset-options="10"
    role="dialog"
    :aria-label="$t('shared.layout.header.locale_pill.aria_label')"
    bg-color="--header-bottom-bg-color"
    shadow
  >
    <template #trigger="{ opened, triggerProps }">
      <button
        type="button"
        class="header-locale__pill"
        :class="{ 'header-locale__pill--opened': opened }"
        data-test-id="locale-pill"
        v-bind="triggerProps"
      >
        <b>{{ currentCurrency?.code }} · {{ currentLanguage.twoLetterLanguageName.toUpperCase() }}</b>

        <VcIcon :name="opened ? 'chevron-up' : 'chevron-down'" size="xxs" />
      </button>
    </template>

    <template #content>
      <div class="header-locale__panel">
        <div class="header-locale__column">
          <section v-if="supportedCurrencies.length > 1" class="header-locale__group">
            <h3 class="header-locale__title">{{ $t("shared.layout.header.locale_pill.currency") }}</h3>

            <button
              v-for="currency in supportedCurrencies"
              :key="currency.code"
              type="button"
              class="header-locale__item"
              :aria-current="currency.code === currentCurrency?.code ? 'true' : undefined"
              @click="selectCurrency(currency.code)"
            >
              <span class="header-locale__symbol">{{ currency.symbol }}</span>

              <b class="header-locale__code">{{ currency.code }}</b>

              <span class="header-locale__name">{{ currency.englishName }}</span>
            </button>
          </section>

          <section v-if="isDarkModeAvailable" class="header-locale__group">
            <h3 class="header-locale__title">{{ $t("shared.layout.header.locale_pill.appearance") }}</h3>

            <div class="header-locale__modes">
              <!-- VcTabSwitch does not write to its model — v-model only feeds `checked`, and the
                   consumer commits the new value from @change (see view-mode.vue). -->
              <VcTabSwitch
                v-for="mode in COLOR_MODES"
                :key="mode.value"
                v-model="colorMode"
                name="header-color-mode"
                :value="mode.value"
                :icon="mode.icon"
                :label="$t(`shared.layout.header.locale_pill.theme.${mode.value}`)"
                size="sm"
                @change="colorMode = $event"
              />
            </div>
          </section>
        </div>

        <div v-if="supportedLanguages.length > 1" class="header-locale__column">
          <section class="header-locale__group">
            <h3 class="header-locale__title">{{ $t("shared.layout.header.locale_pill.language") }}</h3>

            <button
              v-for="language in supportedLanguages"
              :key="language.cultureName"
              type="button"
              class="header-locale__item"
              :aria-current="language.cultureName === currentLanguage.cultureName ? 'true' : undefined"
              :data-culture-name="language.cultureName"
              @click="selectLanguage(language.cultureName)"
            >
              <VcImage
                :src="getFlagIconUrl(getCountryCode(language))"
                :alt="language.nativeName"
                class="header-locale__flag"
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
.header-locale {
  // The panel may be teleported out of the header, so it paints from the same global
  // theme keys the plate uses rather than inheriting anything.
  --ink: var(--header-bottom-text-color);

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
    @apply flex gap-6 p-3;

    // The store decides how many currencies and languages there are — QA serves 9 and 15,
    // which is a panel taller than the window. Each column carries its own scroll.
    max-height: calc(100vh - 7rem);
    color: var(--ink);
  }

  &__column {
    @apply flex min-h-0 flex-col gap-4 overflow-y-auto;
  }

  &__group {
    @apply flex flex-col gap-0.5;
  }

  &__title {
    @apply mb-1 px-2 text-xs font-bold uppercase tracking-wide;

    color: color-mix(in srgb, var(--ink) 55%, transparent);
  }

  &__item {
    @apply flex w-full cursor-pointer items-center gap-2.5 rounded-[--vc-radius] border-0 bg-transparent px-2 py-1.5 text-start text-sm leading-tight;

    color: inherit;
    transition: background var(--transition-duration) ease;

    // A tint of the ink, not a palette step: it lands right in both themes, where a fixed
    // light grey would darken the dark panel instead of lifting it.
    &:hover {
      background: color-mix(in srgb, var(--ink) 8%, transparent);
    }

    &[aria-current="true"] {
      background: color-mix(in srgb, var(--ink) 6%, transparent);
    }
  }

  &__symbol {
    // The column is fixed so the codes line up down the list, and 2rem is what the widest
    // symbol the store can serve needs — QA's GH₵ measures 31px. `truncate` is the backstop:
    // a longer one clips instead of sliding out of the box and over the code next to it.
    @apply w-8 flex-none truncate text-center;

    color: color-mix(in srgb, var(--ink) 55%, transparent);
  }

  &__code {
    @apply flex-none font-bold;
  }

  &__name {
    @apply truncate;

    color: color-mix(in srgb, var(--ink) 55%, transparent);
  }

  &__modes {
    // The design puts the three modes on one segmented rail (VcTabSwitchGroup --filled):
    // the rail sits a step below the panel and the checked switch rides on it as the lighter
    // surface — which is why the rail is neutral-50 and not neutral-100, the step the checked
    // switch itself paints in dark. The kit has no group component, so the rail is built from
    // the switch's own tokens: no per-switch border, and the pill radius stepped down inside.
    @apply grid grid-cols-3 gap-1 rounded-[--vc-radius] border border-neutral-200 bg-neutral-50 p-1;

    --vc-tab-switch-radius: calc(var(--vc-radius) - 2px);
    --vc-tab-switch-border-color: transparent;
  }

  &__flag {
    @apply h-3.5 w-5 flex-none object-cover;
  }
}
</style>
