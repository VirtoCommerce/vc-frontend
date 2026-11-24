<template>
  <VcScrollbar ref="list" vertical role="listbox" class="language-list" test-id="preferences-menu-languages">
    <VcMenuItem
      v-for="language in supportedLanguages"
      :key="language.cultureName"
      role="option"
      color="secondary"
      class="language-list__item"
      :active="isCurrent(language)"
      :aria-selected="isCurrent(language)"
      :data-culture-name="language.cultureName"
      @click="select(language.cultureName)"
    >
      <VcImage :src="getFlagIconUrl(getCountryCode(language))" alt="" class="language-list__flag" lazy />

      <span class="language-list__name">{{ getLanguageName(language) }}</span>
    </VcMenuItem>
  </VcScrollbar>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useLanguageSwitch } from "@/shared/layout/composables/useLanguageSwitch";
import { useListboxKeyboard } from "@/shared/layout/composables/useListboxKeyboard";
import { getFlagIconUrl } from "@/ui-kit/utilities";
import type { ILanguage } from "@/core/types";
import type { ComponentPublicInstance } from "vue";

interface IEmits {
  (event: "select"): void;
}

const emit = defineEmits<IEmits>();

const { currentLanguage, supportedLanguages, selectLanguage, getCountryCode, getLanguageName } = useLanguageSwitch();

const list = useTemplateRef<ComponentPublicInstance>("list");

useListboxKeyboard(() => list.value?.$el as HTMLElement | undefined);

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
  @apply max-h-48;

  &__flag {
    @apply size-3.5 flex-none;
  }

  &__name {
    @apply capitalize;
  }
}
</style>
