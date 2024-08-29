<template>
  <VcDropdownMenu placement="bottom-end" class="language-selector">
    <template #trigger="{ opened }">
      <button type="button" class="language-selector__button">
        <span class="language-selector__label">
          {{ $t("shared.layout.language_selector.label") }}
        </span>

        <VcImage
          :src="`/static/icons/flags/${getCountryCode(currentLanguage)}.svg`"
          :alt="currentLanguage.nativeName"
          class="language-selector__img"
          lazy
        />

        <span class="language-selector__text">
          {{ currentLanguage.twoLetterLanguageName }}
        </span>

        <VcIcon class="language-selector__arrow" size="xxs" :name="opened ? 'chevron-up' : 'chevron-down'" />
      </button>
    </template>

    <template #content="{ close }">
      <VcMenuItem
        v-for="item in supportedLanguages"
        :key="item.twoLetterLanguageName"
        :active="item.twoLetterLanguageName === currentLanguage.twoLetterLanguageName"
        color="secondary"
        @click="
          select(item.twoLetterLanguageName);
          close();
        "
      >
        <VcImage
          :src="`/static/icons/flags/${getCountryCode(item)}.svg`"
          :alt="currentLanguage.nativeName"
          class="language-selector__item-img"
          lazy
        />

        <span class="language-selector__item-text">
          {{ item.nativeName.replace(/ *\([^)]*\) */g, "") }}
        </span>
      </VcMenuItem>
    </template>
  </VcDropdownMenu>
</template>

<script setup lang="ts">
import { useLanguages } from "@/core/composables/useLanguages";
import { languageToCountryMap } from "@/core/constants";
import type { ILanguage } from "@/core/types";

const { currentLanguage, supportedLanguages, pinLocale, addOrRemoveLocaleInUrl } = useLanguages();

function select(locale: string) {
  if (locale !== currentLanguage.value.twoLetterLanguageName) {
    pinLocale(locale);
    addOrRemoveLocaleInUrl(locale);
  }
}

function getCountryCode(language: ILanguage): string {
  return (
    languageToCountryMap[language.cultureName.toLocaleLowerCase()] ||
    languageToCountryMap[language.twoLetterLanguageName] ||
    "xx" // placeholder for unknown country
  );
}
</script>

<style lang="scss">
.language-selector {
  @apply h-full;

  &__button {
    @apply flex h-full items-center gap-3;

    @media (min-width: theme("screens.lg")) {
      @apply gap-1.5;
    }
  }

  &__label {
    @apply hidden;

    @media (min-width: theme("screens.lg")) {
      @apply block text-sm;
    }
  }

  &__img {
    @apply size-7;

    @media (min-width: theme("screens.lg")) {
      @apply size-3.5;
    }
  }

  &__text {
    @apply hidden;

    @media (min-width: theme("screens.lg")) {
      @apply block uppercase text-[--header-top-link-color] hover:text-[--header-top-link-hover-color];
    }
  }

  &__arrow {
    @apply size-4 text-additional-50;

    @media (min-width: theme("screens.lg")) {
      @apply size-2.5 text-primary;
    }
  }

  &__item-img {
    @apply size-3.5;
  }
}
</style>
