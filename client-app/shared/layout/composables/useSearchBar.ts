import { computed, reactive, readonly, ref, shallowRef, toRef, unref } from "vue";
import { Logger, sleep } from "@core/utilities";
import { Category, Product } from "@core/api/graphql/types";
import { getSearchResults, SearchResultsParams } from "@core/api/graphql/catalog";
import { highlightSearchText, prepareSearchText } from "@/shared/layout";
import { MaybeRef } from "@vueuse/core";

const activeAnimations = reactive<Record<"bar" | "dropdown", Promise<void> | null>>({
  bar: null,
  dropdown: null,
});

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

  async function showSearchDropdown(): Promise<void> {
    if (searchDropdownVisible.value) return;
    searchDropdownVisible.value = true;
    await sleep(unref(dropdownAnimationDuration));
  }

  async function hideSearchDropdown(): Promise<void> {
    const activeAnimation = toRef(activeAnimations, "dropdown");

    if (activeAnimation.value) {
      return activeAnimation.value;
    }

    if (!searchDropdownVisible.value) {
      return;
    }

    searchDropdownVisible.value = false;
    activeAnimation.value = sleep(unref(dropdownAnimationDuration)).finally(() => {
      activeAnimation.value = null;
    });

    return activeAnimation.value;
  }

  async function showSearchBar(): Promise<void> {
    if (searchBarVisible.value) return;
    searchBarVisible.value = true;
    await sleep(unref(animationDuration));
  }

  async function hideSearchBar(): Promise<void> {
    const activeAnimation = toRef(activeAnimations, "bar");

    if (activeAnimation.value) {
      return activeAnimation.value;
    }

    if (!searchBarVisible.value) {
      return;
    }

    activeAnimation.value = hideSearchDropdown()
      .then(() => {
        searchBarVisible.value = false;
        return sleep(unref(animationDuration));
      })
      .finally(() => {
        activeAnimation.value = null;
      });

    return activeAnimation.value;
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
