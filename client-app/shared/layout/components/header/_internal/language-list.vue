<template>
  <VcMenuList role="listbox" class="language-list" data-test-id="preferences-menu-languages">
    <VcScrollbar vertical class="language-list__scroll">
      <VcMenuItem
        v-for="language in supportedLanguages"
        :key="language.cultureName"
        color="secondary"
        class="language-list__item"
        :active="isCurrent(language)"
        :data-culture-name="language.cultureName"
        @click="select(language.cultureName)"
      >
        <VcImage :src="getFlagIconUrl(getCountryCode(language))" alt="" class="language-list__flag" lazy />

        <span class="language-list__name">{{ getLanguageName(language) }}</span>
      </VcMenuItem>
    </VcScrollbar>
  </VcMenuList>
</template>

<script setup lang="ts">
import { useLanguageSwitch } from "@/shared/layout/composables/useLanguageSwitch";
import { getFlagIconUrl } from "@/ui-kit/utilities";
import type { ILanguage } from "@/core/types";

interface IEmits {
  (event: "select"): void;
}

const emit = defineEmits<IEmits>();

const { currentLanguage, supportedLanguages, selectLanguage, getCountryCode, getLanguageName } = useLanguageSwitch();

function isCurrent(language: ILanguage): boolean {
  return language.cultureName === currentLanguage.value?.cultureName;
}

function select(cultureName: string): void {
  void selectLanguage(cultureName);
  emit("select");
}
</script>

<style lang="scss">
.language-list {
  &__scroll {
    @apply max-h-48;
  }

  &__flag {
    @apply size-3.5 flex-none;
  }

  &__name {
    @apply capitalize;
  }
}
</style>
