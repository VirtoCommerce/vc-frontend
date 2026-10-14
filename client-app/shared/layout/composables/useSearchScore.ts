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
  const scopeHolds = ref(0);

  const isScopePending = computed(() => preparingScope.value || scopeHolds.value > 0);

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

  // Bridges a page swap: the old scope is dropped before the next page starts preparing its own.
  function holdScope(): () => void {
    scopeHolds.value++;

    let released = false;

    return () => {
      if (!released) {
        released = true;
        scopeHolds.value--;
      }
    };
  }

  let preparingOwner: symbol | undefined;

  // Only the latest caller's finish clears it: a fetch outliving its page must not clear the next page's.
  function prepareScope(): () => void {
    const owner = Symbol("preparingScope");
    preparingOwner = owner;
    preparingScope.value = true;

    return () => {
      if (preparingOwner === owner) {
        preparingOwner = undefined;
        preparingScope.value = false;
      }
    };
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
    isScopePending,

    removeScopeItemByType,
    removeScopeItemById,
    addScopeItem,

    setQueryScope,
    holdScope,
    prepareScope,

    isCategoryScope,
  };
}

export const useSearchScore = createGlobalState(_useSearchScore);
