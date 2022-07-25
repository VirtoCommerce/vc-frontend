<template>
  <div v-click-outside="() => open && hideList()" class="relative select-none text-[13px]">
    <button
      class="relative flex items-center space-x-1 py-3 pr-3.5 appearance-none leading-none text-[color:var(--color-header-top-link)] hover:text-[color:var(--color-header-top-link-hover)]"
      @click="toggle"
    >
      <span class="text-white mr-1" v-if="!isMobile" v-t="'shared.layout.language_selector.label'"></span>

      <span
        class="fi fis rounded-full fa-2x -my-3 !w-[30px] h-[30px] lg:!w-[14px] lg:h-[14px]"
        :class="`fi-${currentLanguage?.twoLetterRegionName.toLowerCase()}`"
      ></span>
      <span v-if="!isMobile" class="uppercase">
        {{ currentLanguage?.twoLetterLanguageName }}
      </span>

      <span class="absolute inset-y-0 -right-3.5 flex items-center pointer-events-none lg:right-0">
        <i
          class="text-[color:var(--color-mobile-menu-link)] fas text-[1rem] lg:text-[color:var(--color-primary)] lg:text-[0.625rem]"
          :class="[open ? 'fa-chevron-up' : 'fa-chevron-down']"
        />
      </span>
    </button>

    <transition name="slide-fade-top">
      <div
        v-show="open"
        class="absolute right-0 z-30 bg-white shadow-lg max-h-[260px] rounded border overflow-hidden"
        :class="{ 'mt-2': isMobile }"
      >
        <ul ref="listElement" class="max-h-[260px] overflow-auto divide-y">
          <li
            v-for="item in supportedLanguages"
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
            <span
              class="fi fis rounded-full shrink-0 fa-2x"
              :class="`fi-${item.twoLetterRegionName.toLowerCase()}`"
            ></span>

            <span
              :class="{ 'font-bold text-black': item.twoLetterLanguageName === currentLanguage?.twoLetterLanguageName }"
            >
              {{ item.nativeName.replace(/ *\([^)]*\) */g, "") }}
            </span>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { clickOutside } from "@/core/directives";

export default {
  directives: {
    clickOutside, // VueUse (v7.5.5) onClickOutside doesn't work in Safari
  },
};
</script>

<script setup lang="ts">
import "flag-icons/css/flag-icons.css";
import { ref, shallowRef } from "vue";
import { useLanguages } from "@/core/composables";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const { currentLanguage, supportedLanguages, saveLocaleAndReload } = useLanguages();
const breakpoints = useBreakpoints(breakpointsTailwind);

const isMobile = breakpoints.smaller("lg");
const open = ref(false);
const listElement = shallowRef<HTMLElement | null>(null);

function hideList() {
  const HIDE_TIMEOUT = 350;
  open.value = false;

  setTimeout(() => {
    if (listElement.value) {
      listElement.value.scrollTop = 0;
    }
  }, HIDE_TIMEOUT);
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
