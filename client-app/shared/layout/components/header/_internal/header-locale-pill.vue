<template>
  <VcPopover
    class="header-locale"
    placement="bottom-end"
    :offset-options="10"
    role="dialog"
    :aria-label="$t('shared.layout.header.locale_pill.aria_label')"
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

              <b>{{ currency.code }}</b>
            </button>
          </section>

          <section v-if="isDarkModeAvailable" class="header-locale__group">
            <h3 class="header-locale__title">{{ $t("shared.layout.header.locale_pill.appearance") }}</h3>

            <VcTabSwitch
              v-for="mode in COLOR_MODES"
              :key="mode.value"
              v-model="colorMode"
              name="header-color-mode"
              :value="mode.value"
              :icon="mode.icon"
              :label="$t(`shared.layout.header.locale_pill.theme.${mode.value}`)"
              size="sm"
            />
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
  &__pill {
    @apply flex flex-none cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border-0 px-3.5 py-2 text-sm;

    background: transparent;
    color: var(--header-bottom-link-color);
    transition:
      background var(--transition-duration) ease,
      color var(--transition-duration) ease;

    b {
      @apply font-semibold;

      color: var(--header-bottom-text-color);
    }

    &:hover {
      background: color-mix(in srgb, var(--header-bottom-text-color) 6%, transparent);
    }

    &--opened {
      background: color-mix(in srgb, var(--header-bottom-text-color) 8%, transparent);
    }
  }

  &__panel {
    @apply flex gap-6 p-3;
  }

  &__column {
    @apply flex min-w-40 flex-col gap-4;
  }

  &__group {
    @apply flex flex-col gap-0.5;
  }

  &__title {
    @apply mb-1 px-2 text-xs font-bold uppercase tracking-wide text-neutral-500;
  }

  &__item {
    @apply flex w-full cursor-pointer items-center gap-2.5 rounded-[--vc-radius] border-0 bg-transparent px-2 py-1.5 text-start text-sm leading-tight;

    &:hover {
      @apply bg-neutral-100;
    }

    &[aria-current="true"] {
      @apply font-bold;
    }
  }

  &__symbol {
    @apply w-4 text-center text-neutral-500;
  }

  &__flag {
    @apply h-3.5 w-5 flex-none object-cover;
  }
}
</style>
