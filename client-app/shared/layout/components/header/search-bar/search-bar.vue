<template>
  <div ref="searchBarElement" class="search-bar">
    <VcInput
      v-model="searchPhrase"
      type="search"
      maxlength="999"
      class="search-bar__input"
      :clearable="!!searchPhrase"
      :placeholder="searchPlaceholder"
      @clear="reset"
      @keyup.esc="hideSearchDropdown"
      @keyup.arrow-down="focusFirstItem"
      @input="onSearchPhraseChanged"
      @focus="onSearchBarFocused"
    >
      <template #prepend>
        <VcButton
          v-if="preparingScope"
          class="search-bar__button"
          color="secondary"
          append-icon="delete-2"
          size="xs"
          variant="solid-light"
          disabled
          loading
          min-width="5rem"
          :aria-label="$t('shared.layout.search_bar.scope_loading_label')"
        />

        <VcButton
          v-for="item in searchScopeData.searchScope"
          :key="item.id"
          class="search-bar__button"
          color="secondary"
          append-icon="delete-2"
          size="xs"
          variant="solid-light"
          :aria-label="$t('shared.layout.search_bar.scope_remove_label', { label: item.label })"
          @click.stop="onScopeItemClick(item.id)"
        >
          {{ item.label }}
        </VcButton>
      </template>

      <template #append>
        <BarcodeScanner
          v-if="!searchPhrase"
          :aria-label="$t('shared.layout.search_bar.barcode_detector.title')"
          @scanned-code="onBarcodeScanned"
        />

        <VcButton
          :aria-label="$t('shared.layout.search_bar.search_button')"
          icon="search"
          icon-size="1.25rem"
          :loading="loading"
          @click="searchDropdownRef?.handleSearch()"
        />
      </template>
    </VcInput>

    <transition name="slide-fade-top">
      <SearchDropdown
        v-if="searchDropdownVisible"
        ref="searchDropdownRef"
        class="search-bar__dropdown"
        :style="searchDropdownStyle"
        :search-phrase="searchPhrase"
        @hide="hideSearchDropdown"
        @product-select="handleProductSelect"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside, useElementBounding, whenever } from "@vueuse/core";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouteQueryParam } from "@/core/composables";
import { QueryParamName } from "@/core/enums";
import { toCSV } from "@/core/utilities";
import { useSearchBar } from "@/shared/layout/composables/useSearchBar";
import { useSearchScore } from "@/shared/layout/composables/useSearchScore";
import SearchDropdown from "../_internal/search-dropdown.vue";
import BarcodeScanner from "./barcode-scanner.vue";
import type { StyleValue } from "vue";

const searchBarElement = ref<HTMLElement | null>(null);
const searchDropdownRef = ref<{ handleSearch: () => void } | null>(null);

const { searchBarVisible, searchDropdownVisible, loading, hideSearchDropdown, showSearchDropdown } = useSearchBar();

const searchPhraseInUrl = useRouteQueryParam<string>(QueryParamName.SearchPhrase);

const searchPhrase = ref("");

const { bottom } = useElementBounding(searchBarElement);

const searchDropdownStyle = computed<StyleValue | undefined>(() => {
  return { maxHeight: bottom.value ? `calc(100vh - ${bottom.value + 40}px)` : "auto" };
});

onClickOutside(searchBarElement, hideSearchDropdown);

const { searchScopeData, removeScopeItemById, isCategoryScope, preparingScope } = useSearchScore();

const { t } = useI18n();

const searchPlaceholder = computed(() => {
  return isCategoryScope.value
    ? t("shared.layout.search_bar.enter_keyword_placeholder_category", { category: getCategoriesNames() })
    : t("shared.layout.search_bar.enter_keyword_placeholder");
});

function getCategoriesNames() {
  return toCSV(searchScopeData.value.searchScope.filter((item) => item.type === "category").map((el) => el.label));
}

function onScopeItemClick(itemId: string | number) {
  removeScopeItemById(itemId);
}

function reset() {
  searchPhrase.value = "";
  hideSearchDropdown();
}

function onSearchPhraseChanged() {
  if (searchPhrase.value.trim()) {
    showSearchDropdown();
  }
}

function onSearchBarFocused() {
  showSearchDropdown();
}

function focusFirstItem() {
  if (!searchDropdownVisible.value) {
    return;
  }

  const item = document.querySelector(".search-bar__dropdown [tabindex='0']") as HTMLElement;

  if (item) {
    item.focus();
  }
}

function handleProductSelect() {
  hideSearchDropdown();
}

whenever(searchBarVisible, () => (searchPhrase.value = searchPhraseInUrl.value ?? ""), { immediate: true });

onMounted(() => {
  if (searchPhraseInUrl.value) {
    searchPhrase.value = searchPhraseInUrl.value;
  }
});

const onBarcodeScanned = (value: string) => {
  if (value) {
    searchPhrase.value = value;
  }
};

watch(
  () => searchScopeData.value.queryScope,
  (value) => {
    if (value !== searchPhrase.value) {
      searchPhrase.value = value;
    }
  },
  { deep: true },
);
</script>

<style lang="scss">
.search-bar {
  @apply relative flex grow items-stretch;

  &__input {
    @apply w-full;
  }

  &__button {
    @apply ms-1;
  }

  &__dropdown {
    @apply z-20 absolute left-0 top-[3.45rem] w-full min-w-[640px] max-w-[100vw];
  }
}
</style>
