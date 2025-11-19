<template>
  <div class="mobile-search-bar">
    <div
      class="mobile-search-bar__backdrop"
      role="button"
      tabindex="-1"
      :aria-label="$t('common.labels.close')"
      @click="hideSearchBar"
      @keydown.enter="hideSearchBar"
      @keydown.space.prevent="hideSearchBar"
    ></div>

    <div class="mobile-search-bar__content">
      <div class="mobile-search-bar__wrapper">
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

      <SearchDropdown
        ref="searchDropdownRef"
        class="mobile-search-bar__dropdown"
        :search-phrase="searchPhrase"
        @hide="handleSearchDropdownHide"
        @product-select="handleProductSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouteQueryParam } from "@/core/composables";
import { QueryParamName } from "@/core/enums";
import { useSearchBar } from "@/shared/layout/composables/useSearchBar";
import BarcodeScanner from "../search-bar/barcode-scanner.vue";
import SearchDropdown from "./search-dropdown.vue";

const searchPhrase = ref("");
const searchPhraseInUrl = useRouteQueryParam<string>(QueryParamName.SearchPhrase);

const { hideSearchBar, showSearchDropdown, hideSearchDropdown } = useSearchBar();

const searchDropdownRef = ref<{ handleSearch: () => void } | null>(null);

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
  @apply relative;

  &__backdrop {
    @apply fixed left-0 right-0 bottom-0 cursor-pointer;

    top: calc(2.125rem + 3.5rem);
    background-color: rgba(194, 195, 195, 0.6);
  }

  &__content {
    @apply relative z-10 bg-[--mobile-search-bar-bg] p-3.5;
  }

  &__wrapper {
    @apply flex select-none items-center;
  }

  &__input {
    @apply me-2.5 grow;
  }

  &__close {
    @apply appearance-none text-[--link-color] text-sm;
  }
}
</style>
