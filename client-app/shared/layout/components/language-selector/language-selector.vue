<template>
  <div v-on-click-outside="() => open && hideList()" class="relative select-none">
    <button
      type="button"
      class="relative flex appearance-none items-center gap-x-1.5 py-3 leading-none text-accent-300 hover:text-additional-50"
      @click="toggle"
    >
      <span v-t="'shared.layout.language_selector.label'" class="hidden text-additional-50 lg:inline"></span>

      <span
        class="fi fis fa-2x -my-3 h-[30px] !w-[30px] rounded-full lg:h-[14px] lg:!w-[14px]"
        :class="`fi-${currentLanguage?.twoLetterRegionName.toLowerCase()}`"
      ></span>

      <span class="hidden uppercase lg:inline">
        {{ currentLanguage?.twoLetterLanguageName }}
      </span>

      <VcIcon
        class="text-[--color-accent-200] [--vc-icon-size:1rem] lg:text-[--color-primary-500] lg:[--vc-icon-size:0.625rem]"
        :name="open ? 'chevron-up' : 'chevron-down'"
      />
    </button>

    <transition name="slide-fade-top">
      <div
        v-show="open"
        class="absolute right-0 z-30 mt-2 max-h-[260px] overflow-hidden rounded border bg-additional-50 shadow-lg lg:mt-0"
      >
        <ul ref="listElement" class="max-h-[260px] divide-y overflow-auto">
          <li
            v-for="item in supportedLanguages"
            :key="item.twoLetterLanguageName"
            :class="[
              item.twoLetterLanguageName === currentLanguage?.twoLetterLanguageName
                ? 'cursor-default bg-primary'
                : 'cursor-pointer hover:bg-gray-100',
            ]"
            class="flex items-center space-x-2 p-2.5 pr-3 font-normal text-additional-950"
            @click="
              item.twoLetterLanguageName === currentLanguage?.twoLetterLanguageName
                ? null
                : select(item.twoLetterLanguageName)
            "
          >
            <span
              class="fi fis fa-2x shrink-0 rounded-full"
              :class="`fi-${item.twoLetterRegionName.toLowerCase()}`"
            ></span>

            <span
              :class="{
                'font-bold text-additional-950': item.twoLetterLanguageName === currentLanguage?.twoLetterLanguageName,
              }"
            >
              {{ item.nativeName.replace(/ *\([^)]*\) */g, "") }}
            </span>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import "flag-icons/css/flag-icons.css";
import { ref, shallowRef } from "vue";
import { useLanguages } from "@/core/composables";

const { currentLanguage, supportedLanguages, saveLocaleAndReload } = useLanguages();

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
