import { createGlobalState } from "@vueuse/core";
import { computed, readonly, ref } from "vue";
import { getSearchResults } from "@/core/api/graphql/catalog";
import { useThemeContext } from "@/core/composables";
import { Logger } from "@/core/utilities";
import { highlightSearchText, prepareSearchText } from "../utils";
import type { GetSearchResultsParamsType } from "@/core/api/graphql/catalog";
import type { Category, PageType, Product } from "@/core/api/graphql/types";

/**
 * Extracts the display name from a page object.
 * Handles both PageType (with 'name') and PageDocumentType (with 'title').
 * Falls back to permalink if neither name nor title is available.
 */
function getPageName(item: { title?: string; name?: string; permalink?: string }) {
  return item.name ?? item.title ?? item.permalink ?? "";
}

function _useSearchBar() {
  const { themeContext } = useThemeContext();

  const loading = ref(false);
  const searchBarVisible = ref(false);
  const searchDropdownVisible = ref(false);
  const searchPhraseOfUploadedResults = ref("");
  const categories = ref<Category[]>([]);
  const products = ref<Product[]>([]);
  const pages = ref<PageType[]>([]);
  const suggestions = ref<{ text: string; label: string }[]>([]);
  const total = ref(0);

  const maxSearchLength = computed(() => themeContext.value?.settings?.search_max_chars || 999);

  function showSearchDropdown() {
    if (!searchDropdownVisible.value) {
      searchDropdownVisible.value = true;
    }
  }

  function hideSearchDropdown() {
    if (searchDropdownVisible.value) {
      searchDropdownVisible.value = false;
    }
  }

  function toggleSearchBar() {
    searchBarVisible.value = !searchBarVisible.value;
  }

  function hideSearchBar() {
    if (searchBarVisible.value) {
      searchBarVisible.value = false;
    }
  }

  async function searchResults(params: GetSearchResultsParamsType) {
    const preparedParams: GetSearchResultsParamsType = {
      ...params,
      keyword: prepareSearchText(params.keyword),
    };

    loading.value = true;

    try {
      const result = await getSearchResults(preparedParams);
      if (!result) {
        return;
      }

      const {
        productSuggestions: { suggestions: suggestionsItems = [] },
        pages: { items: pagesItems = [] },
        categories: { items: categoriesItems = [] },
        products: { items: productsItems = [], totalCount = 0 },
      } = result;

      suggestions.value = suggestionsItems.map((item) => ({
        text: item,
        label: highlightSearchText(item, params.keyword),
      }));

      pages.value = pagesItems.map((item) => ({
        ...item,
        name: highlightSearchText(getPageName(item), params.keyword),
      })) as PageType[]; // TODO: remove type assertion

      categories.value = categoriesItems.map((item) => ({
        ...item,
        name: highlightSearchText(item.name, params.keyword),
      })) as Category[]; // TODO: remove type assertion

      total.value = totalCount;
      products.value = productsItems as Product[]; // TODO: remove type assertion
      searchPhraseOfUploadedResults.value = preparedParams.keyword;
      loading.value = false;
    } catch (e) {
      Logger.error(`${useSearchBar.name}.${searchResults.name}`, e);
      loading.value = false;
      throw e;
    }
  }

  function clearSearchResults() {
    suggestions.value = [];
    pages.value = [];
    categories.value = [];
    total.value = 0;
    products.value = [];
    searchPhraseOfUploadedResults.value = "";
  }

  return {
    searchResults,
    toggleSearchBar,
    hideSearchBar,
    showSearchDropdown,
    hideSearchDropdown,
    total: readonly(total),
    loading: readonly(loading),
    searchBarVisible: readonly(searchBarVisible),
    searchDropdownVisible: readonly(searchDropdownVisible),
    searchPhraseOfUploadedResults: readonly(searchPhraseOfUploadedResults),
    maxSearchLength,
    categories: computed(() => categories.value),
    products: computed(() => products.value),
    pages: computed(() => pages.value),
    suggestions: computed(() => suggestions.value),

    clearSearchResults,
  };
}

export const useSearchBar = createGlobalState(_useSearchBar);
