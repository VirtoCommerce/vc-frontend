import { createGlobalState } from "@vueuse/core";
import { ref, computed } from "vue";

type SearchScope = {
  queryScope: string;
  searchScope: ScopeItemType[];
};

type ScopeItemType = {
  id: string | number;
  label: string;
  filter: string;
  type: "category";
};

function _useSearchScore() {
  const searchScopeData = ref<SearchScope>({
    queryScope: "",
    searchScope: [],
  });

  const preparingScope = ref(false);

  const isCategoryScope = computed(() => {
    return searchScopeData.value.searchScope.some((el) => el.type === "category");
  });

  const searchScopeFilterExpression = computed(() => {
    return searchScopeData.value.searchScope.map((el) => el.filter).join(" ");
  });

  function removeScopeItemByType(itemType: ScopeItemType["type"]) {
    searchScopeData.value.searchScope = searchScopeData.value.searchScope.filter((el) => el.type !== itemType);
  }

  function removeScopeItemById(itemId: ScopeItemType["id"]) {
    searchScopeData.value.searchScope = searchScopeData.value.searchScope.filter((el) => el.id !== itemId);
  }

  function addScopeItem(item: ScopeItemType) {
    searchScopeData.value.searchScope.push(item);
  }

  function setQueryScope(query: string) {
    searchScopeData.value = {
      ...searchScopeData.value,
      queryScope: query,
    };
  }

  return {
    searchScopeData,
    searchScopeFilterExpression,
    preparingScope,

    removeScopeItemByType,
    removeScopeItemById,
    addScopeItem,

    setQueryScope,

    isCategoryScope,
  };
}

export const useSearchScore = createGlobalState(_useSearchScore);
