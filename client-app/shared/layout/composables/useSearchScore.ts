import { createGlobalState } from "@vueuse/core";
import { ref, computed } from "vue";

type ScopeItemType = {
  id: string | number;
  label: string;
  filter: string;
  type: "category";
};

function _useSearchScore() {
  const searchScope = ref<ScopeItemType[]>([]);

  const isCategoryScope = computed(() => {
    return searchScope.value.some((el) => el.type === "category");
  });

  const searchScopeFilterExpression = computed(() => {
    return searchScope.value.map((el) => el.filter).join(" ");
  });

  function removeScopeItemByType(itemType: ScopeItemType["type"]) {
    searchScope.value = searchScope.value.filter((el) => el.type !== itemType);
  }

  function removeScopeItemById(itemId: ScopeItemType["id"]) {
    searchScope.value = searchScope.value.filter((el) => el.id !== itemId);
  }

  function addScopeItem(item: ScopeItemType) {
    searchScope.value.push(item);
  }

  return {
    searchScope,
    searchScopeFilterExpression,

    removeScopeItemByType,
    removeScopeItemById,
    addScopeItem,

    isCategoryScope,
  };
}

export const useSearchScore = createGlobalState(_useSearchScore);
