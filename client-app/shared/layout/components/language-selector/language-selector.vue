<template>
  <div v-click-outside="hideList" class="relative select-none">
    <button
      class="relative flex items-center space-x-1 py-3 pr-3.5 appearance-none leading-none text-[color:var(--color-header-top-link)] hover:text-[color:var(--color-header-top-link-hover)]"
      @click="toggle"
    >
      <span class="text-white mr-1.5" v-if="!isMobile"> Language: </span>
      <lang-flag class="rounded-full fa-2x" :iso="currentLanguage?.twoLetterLanguageName" />
      <span
        v-if="!isMobile"
        class="uppercase text-[color:var(--color-header-top-link)] hover:text-[color:var(--color-header-top-link-hover)]"
      >
        {{ currentLanguage?.twoLetterLanguageName }}
      </span>

      <span class="absolute inset-y-0 right-0 flex items-center pointer-events-none">
        <i class="text-[color:var(--color-primary)] fas fa-chevron-down text-[0.625rem]" />
      </span>
    </button>

    <transition name="slide-fade-top">
      <div v-show="open" class="absolute -mt-1 right-0 z-10 bg-white shadow-lg max-h-96 rounded border overflow-hidden">
        <ul ref="listElement" class="max-h-56 overflow-auto divide-y">
          <li
            v-for="item in availableLanguages"
            :key="item.twoLetterLanguageName"
            :class="[
              item.twoLetterLanguageName === currentLanguage?.twoLetterLanguageName
                ? 'cursor-default'
                : 'cursor-pointer',
            ]"
            class="flex items-center space-x-2 p-2.5 pr-3 font-normal text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]"
            @click="
              item.twoLetterLanguageName === currentLanguage?.twoLetterLanguageName
                ? null
                : select(item.twoLetterLanguageName)
            "
          >
            <lang-flag class="rounded-full shrink-0 fa-2x" :iso="item.twoLetterLanguageName" />

            <span
              :class="{ 'font-bold text-black': item.twoLetterLanguageName === currentLanguage?.twoLetterLanguageName }"
            >
              {{ item.nativeName }}
            </span>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { clickOutside } from "@core/directives";

export default {
  directives: {
    clickOutside, // VueUse (v7.5.5) onClickOutside doesn't work in Safari
  },
};
</script>

<script setup lang="ts">
import LangFlag from "vue-lang-code-flags";
import { ref, shallowRef } from "vue";
import useLocalization from "@/core/composables/useLocalization";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const { currentLanguage, availableLanguages, saveLocaleAndReload } = useLocalization();
const breakpoints = useBreakpoints(breakpointsTailwind);

const isMobile = breakpoints.smaller("md");
const open = ref(false);
const listElement = shallowRef<HTMLElement | null>(null);

function hideList() {
  open.value = false;

  setTimeout(() => {
    if (listElement.value) {
      listElement.value.scrollTop = 0;
    }
  }, 350);
}

function toggle() {
  if (open.value) {
    hideList();
  } else {
    open.value = true;
  }
}

function select(locale: string) {
  saveLocaleAndReload(locale);
  hideList();
}
</script>
