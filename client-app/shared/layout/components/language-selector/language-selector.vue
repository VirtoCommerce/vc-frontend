<template>
  <VcDropdownMenu
    placement="bottom-end"
    class="language-selector"
    data-test-id="main-layout.top-header.language-selector"
  >
    <template #trigger="{ opened, triggerProps }">
      <button
        type="button"
        class="language-selector__button"
        data-test-id="main-layout.top-header.language-selector-button"
        v-bind="triggerProps"
      >
        <span class="language-selector__label">
          {{ $t("shared.layout.language_selector.label") }}
        </span>

        <VcImage
          :src="getFlagIconUrl(getCountryCode(currentLanguage))"
          :alt="currentLanguage.nativeName"
          class="language-selector__img"
          lazy
        />

        <span class="language-selector__text" data-test-id="main-layout.top-header.current-language-label">
          {{ currentLanguage.twoLetterLanguageName }}
        </span>

        <VcIcon class="language-selector__arrow" size="xxs" :name="opened ? 'chevron-up' : 'chevron-down'" />
      </button>
    </template>

    <template #content="{ close }">
      <VcMenuItem
        v-for="item in supportedLanguages"
        :key="item.cultureName"
        :active="item.cultureName === currentLanguage.cultureName"
        :data-test-culture-name="item.cultureName"
        data-test-id="main-layout.top-header.language-selector-item"
        color="secondary"
        @click="
          select(item.cultureName);
          close();
        "
      >
        <VcImage
          :src="getFlagIconUrl(getCountryCode(item))"
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
import { getSlugInfo } from "@/core/api/graphql/slugInfo/queries/getSlugInfo";
import { useLanguages } from "@/core/composables/useLanguages";
import { languageToCountryMap } from "@/core/constants";
import { dataChangedEvent, useBroadcast } from "@/shared/broadcast";
import { getFlagIconUrl } from "@/ui-kit/utilities";
import type { ILanguage } from "@/core/types";

const {
  supportedLanguages,
  pinLocale,
  removeLocaleFromUrl,
  currentLanguage,
  previousCultureSlug,
  getUrlWithoutLocale,
} = useLanguages();
const broadcast = useBroadcast();

async function select(cultureName: string) {
  pinLocale(cultureName);
  const permalink = location.pathname.slice(1);

  if (cultureName === currentLanguage.value?.cultureName) {
    return;
  }

  const slugInfo = await getSlugInfo({ permalink, cultureName });

  if (!slugInfo?.entityInfo) {
    previousCultureSlug.value = {
      cultureName: currentLanguage.value?.cultureName,
      slug: getUrlWithoutLocale(location.pathname).slice(1),
    };
  } else {
    previousCultureSlug.value = {
      cultureName: "",
      slug: "",
    };
  }

  removeLocaleFromUrl();
  void broadcast.emit(dataChangedEvent);
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
  @apply flex h-full items-stretch;

  &__button {
    @apply flex h-full items-center gap-3 p-1;

    @media (min-width: theme("screens.lg")) {
      @apply gap-1.5;
    }
  }

  &__label {
    @apply hidden;

    @media (min-width: theme("screens.lg")) {
      @apply block text-sm whitespace-nowrap;
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
    @apply size-4 fill-[--mobile-menu-navigation-color];

    @media (min-width: theme("screens.lg")) {
      @apply size-2.5 fill-primary;
    }
  }

  &__item-img {
    @apply size-3.5;
  }

  &__item-text {
    @apply capitalize;
  }
}
</style>
