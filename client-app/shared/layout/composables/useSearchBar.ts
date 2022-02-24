import { computed, readonly, ref, shallowRef, unref } from "vue";
import { Logger, sleep } from "@core/utilities";
import { Category, Product } from "@core/api/graphql/types";
import { getSearchResults, SearchResultsParams } from "@core/api/graphql/catalog";
import { highlightSearchText, prepareSearchText } from "@/shared/layout";
import { MaybeRef } from "@vueuse/core";

const loading = ref(false);
const searchBarVisible = ref(false);
const searchDropdownVisible = ref(false);
const searchPhraseOfUploadedResults = ref("");
const categories = shallowRef<Category[]>([]);
const products = shallowRef<Product[]>([]);
const total = ref(0);

export default (
  options: {
    // @default 300
    animationDuration?: MaybeRef<number>;
    // @default 200
    dropdownAnimationDuration?: MaybeRef<number>;
  } = {}
) => {
  const { animationDuration = 300, dropdownAnimationDuration = 200 } = options;

  async function showSearchDropdown() {
    if (searchDropdownVisible.value) return;
    searchDropdownVisible.value = true;
    await sleep(unref(dropdownAnimationDuration));
  }

  async function hideSearchDropdown() {
    if (!searchDropdownVisible.value) return;
    searchDropdownVisible.value = false;
    await sleep(unref(dropdownAnimationDuration));
  }

  async function showSearchBar() {
    if (searchBarVisible.value) return;
    searchBarVisible.value = true;
    await sleep(unref(animationDuration));
  }

  async function hideSearchBar() {
    await hideSearchDropdown();
    if (!searchBarVisible.value) return;
    searchBarVisible.value = false;
    await sleep(unref(animationDuration));
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
      Logger.error(`useSearchBar.${searchResults.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    searchResults,
    showSearchBar,
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
};
