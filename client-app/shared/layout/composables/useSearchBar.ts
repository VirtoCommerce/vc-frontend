import { computed, readonly, ref, shallowRef } from "vue";
import { Logger } from "@/core/utilities";
import { getSearchResults } from "@/xapi/graphql/catalog";
import { highlightSearchText, prepareSearchText } from "../utils";
import type { SearchResultsParams } from "@/xapi/graphql/catalog";
import type { Category, Product } from "@/xapi/types";

const loading = ref(false);
const searchBarVisible = ref(false);
const searchDropdownVisible = ref(false);
const searchPhraseOfUploadedResults = ref("");
const categories = shallowRef<Category[]>([]);
const products = shallowRef<Product[]>([]);
const total = ref(0);

export default function useSearchBar() {
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

  async function searchResults(params: SearchResultsParams) {
    const preparedParams: SearchResultsParams = {
      ...params,
      keyword: prepareSearchText(params.keyword),
    };

    if (searchPhraseOfUploadedResults.value === preparedParams.keyword) {
      return;
    }

    loading.value = true;

    try {
      const {
        categories: { items: categoriesItems = [] },
        products: { items: productsItems = [], totalCount = 0 },
      } = await getSearchResults(preparedParams);

      total.value = totalCount;
      products.value = productsItems;
      categories.value = categoriesItems.map((item) => ({
        ...item,
        name: highlightSearchText(item.name, params.keyword),
      }));

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
  };
}
