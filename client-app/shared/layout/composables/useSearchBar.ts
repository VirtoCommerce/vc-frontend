import { computed, readonly, ref, shallowRef } from "vue";
import { getSearchResults } from "@/core/api/graphql/catalog";
import { Logger } from "@/core/utilities";
import { highlightSearchText, prepareSearchText } from "../utils";
import type { GetSearchResultsParamsType } from "@/core/api/graphql/catalog";
import type { Category, PageType, Product } from "@/core/api/graphql/types";

const loading = ref(false);
const searchBarVisible = ref(false);
const searchDropdownVisible = ref(false);
const searchPhraseOfUploadedResults = ref("");
const categories = shallowRef<Category[]>([]);
const products = shallowRef<Product[]>([]);
const pages = shallowRef<PageType[]>([]);
const suggestions = shallowRef<{ text: string; label: string }[]>([]);
const total = ref(0);

export function useSearchBar() {
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

  function searchResults(params: GetSearchResultsParamsType) {
    const preparedParams: GetSearchResultsParamsType = {
      ...params,
      keyword: prepareSearchText(params.keyword),
    };

    if (searchPhraseOfUploadedResults.value === preparedParams.keyword) {
      return;
    }

    loading.value = true;

    try {
      const {
        productSuggestions: { suggestions: suggestionsItems = [] },
        pages: { items: pagesItems = [] },
        categories: { items: categoriesItems = [] },
        products: { items: productsItems = [], totalCount = 0 },
      } = getSearchResults(preparedParams);

      suggestions.value = suggestionsItems.map((item) => ({
        text: item,
        label: highlightSearchText(item, params.keyword),
      }));

      pages.value = pagesItems.map((item) => ({
        ...item,
        name: highlightSearchText(item.name ?? "", params.keyword),
      }));

      categories.value = categoriesItems.map((item) => ({
        ...item,
        name: highlightSearchText(item.name, params.keyword),
      }));

      total.value = totalCount;
      products.value = productsItems;
      searchPhraseOfUploadedResults.value = preparedParams.keyword;
    } catch (e) {
      Logger.error(`${useSearchBar.name}.${searchResults.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
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
    categories: computed(() => categories.value),
    products: computed(() => products.value),
    pages: computed(() => pages.value),
    suggestions: computed(() => suggestions.value),
  };
}
