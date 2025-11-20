<template>
  <div class="mobile-search-bar">
    <transition name="fade">
      <div
        v-if="visible"
        class="mobile-search-bar__backdrop"
        role="button"
        tabindex="-1"
        :aria-label="$t('common.labels.close')"
        @click="hideSearchBar"
        @keydown.enter="hideSearchBar"
        @keydown.space.prevent="hideSearchBar"
      ></div>
    </transition>

    <transition name="slide-down">
      <div v-if="visible" ref="contentElement" class="mobile-search-bar__content">
        <div ref="wrapperElement" class="mobile-search-bar__wrapper">
          <VcInput
            v-model="searchPhrase"
            type="search"
            maxlength="64"
            :placeholder="$t('shared.layout.header.mobile.search_bar.input_placeholder')"
            class="mobile-search-bar__input"
            :clearable="!!searchPhrase"
            @clear="reset"
            @keydown.enter="searchDropdownRef?.handleSearch()"
          >
            <template #append>
              <BarcodeScanner v-if="!searchPhrase" @scanned-code="onBarcodeScanned" />

              <VcButton class="mobile-search-bar__button" icon="search" @click="searchDropdownRef?.handleSearch()" />
            </template>
          </VcInput>

          <button type="button" class="mobile-search-bar__close" @click="hideSearchBar">Cancel</button>
        </div>

        <VcScrollbar class="mobile-search-bar__dropdown" vertical :style="dropdownStyle">
          <SearchDropdown
            ref="searchDropdownRef"
            :search-phrase="searchPhrase"
            @hide="handleSearchDropdownHide"
            @product-select="handleProductSelect"
          />
        </VcScrollbar>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useElementBounding } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";
import { useRouteQueryParam } from "@/core/composables";
import { QueryParamName } from "@/core/enums";
import { useSearchBar } from "@/shared/layout/composables/useSearchBar";
import BarcodeScanner from "../search-bar/barcode-scanner.vue";
import SearchDropdown from "./search-dropdown.vue";
import type { StyleValue } from "vue";

interface IProps {
  visible: boolean;
}

defineProps<IProps>();

const searchPhrase = ref("");
const searchPhraseInUrl = useRouteQueryParam<string>(QueryParamName.SearchPhrase);

const { hideSearchBar, showSearchDropdown, hideSearchDropdown } = useSearchBar();

const searchDropdownRef = ref<{ handleSearch: () => void } | null>(null);
const contentElement = ref<HTMLElement | null>(null);
const wrapperElement = ref<HTMLElement | null>(null);

const { top: contentTop } = useElementBounding(contentElement);
const { height: wrapperHeight } = useElementBounding(wrapperElement);

const dropdownStyle = computed<StyleValue>(() => {
  const dropdownTop = contentTop.value + wrapperHeight.value;

  if (!dropdownTop || dropdownTop <= 0) {
    return {};
  }

  return {
    maxHeight: `calc(100dvh - ${dropdownTop}px)`,
  };
});

function reset() {
  searchPhrase.value = "";
  hideSearchDropdown();
}

function onBarcodeScanned(value: string) {
  if (value) {
    searchPhrase.value = value;
  }
}

function handleSearchDropdownHide() {
  hideSearchBar();
  hideSearchDropdown();
}

function handleProductSelect() {
  hideSearchBar();
  hideSearchDropdown();
}

onMounted(() => {
  searchPhrase.value = searchPhraseInUrl.value ?? "";

  if (searchPhrase.value.trim()) {
    showSearchDropdown();
  }
});
</script>

<style lang="scss">
.mobile-search-bar {
  &__backdrop {
    @apply fixed left-0 right-0 bottom-0 z-10 cursor-pointer;

    top: calc(2.125rem + 3.5rem);
    background-color: rgba(194, 195, 195, 0.6);

    @media (min-width: theme("screens.md")) {
      @apply hidden;
    }
  }

  &__content {
    @apply fixed left-0 right-0 z-10 bg-[--mobile-search-bar-bg];

    top: calc(2.125rem + 3.5rem);
  }

  &__wrapper {
    @apply flex select-none items-center p-3.5;
  }

  &__input {
    @apply me-2.5 grow;
  }

  &__close {
    @apply appearance-none text-[--link-color] text-sm;
  }

  &__dropdown {
    @apply px-3.5 pb-3.5;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .slide-down-enter-active {
    transition: transform 0.3s ease;
    transition-delay: 0.1s;
  }

  .slide-down-leave-active {
    transition: transform 0.3s ease;
  }

  .slide-down-enter-from {
    transform: translateY(-100%);
  }

  .slide-down-leave-to {
    transform: translateY(-100%);
  }
}
</style>
