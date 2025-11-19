<template>
  <transition name="slide-fade-top">
    <div v-if="searchBarVisible" class="flex select-none items-center bg-[--mobile-search-bar-bg] p-4">
      <div class="flex select-none items-center bg-[--mobile-search-bar-bg] p-4">
        <VcInput
          v-model="searchPhrase"
          type="search"
          maxlength="64"
          :placeholder="$t('shared.layout.header.mobile.search_bar.input_placeholder')"
          class="mr-4 grow"
          :clearable="!!searchPhrase"
          no-border
          @clear="reset"
          @keydown.enter="handleSearch"
        >
          <template #append>
            <BarcodeScanner v-if="!searchPhrase" @scanned-code="onBarcodeScanned" />
          </template>
        </VcInput>

        <VcButton icon="search" @click="handleSearch" />

        <button type="button" class="-mr-2 ml-2 h-11 appearance-none px-3" @click="hideSearchBar">
          <VcIcon name="delete-thin" class="fill-additional-50" />
        </button>
      </div>

      <SearchDropdown
        :search-phrase="searchPhrase"
        @hide="handleSearchDropdownHide"
        @product-select="handleProductSelect"
      />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { whenever } from "@vueuse/core";
import { ref } from "vue";
import { useRouteQueryParam } from "@/core/composables";
import { QueryParamName } from "@/core/enums";
import { useSearchBar } from "@/shared/layout/composables/useSearchBar";
import BarcodeScanner from "../search-bar/barcode-scanner.vue";
import SearchDropdown from "./search-dropdown.vue";

const searchPhrase = ref("");
const searchPhraseInUrl = useRouteQueryParam<string>(QueryParamName.SearchPhrase);

const { searchBarVisible, hideSearchBar, showSearchDropdown, hideSearchDropdown } = useSearchBar();

function reset() {
  searchPhrase.value = "";
  hideSearchDropdown();
}

function onBarcodeScanned(value: string) {
  if (value) {
    searchPhrase.value = value;
  }
}

function handleSearch() {
  if (searchPhrase.value.trim()) {
    showSearchDropdown();
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

whenever(
  searchBarVisible,
  () => {
    searchPhrase.value = searchPhraseInUrl.value ?? "";

    if (searchPhrase.value.trim()) {
      showSearchDropdown();
    }
  },
  { immediate: true },
);
</script>
