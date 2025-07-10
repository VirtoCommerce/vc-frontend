import { computed, readonly, ref, shallowRef } from "vue";
import { getCategory } from "@/core/api/graphql";
import { globals } from "@/core/globals";
import { getCategoryRoute, Logger, isActiveRoute } from "@/core/utilities";
import type { ExtendedQueryCategoryArgsType } from "@/core/api/graphql";
import type { Category } from "@/core/api/graphql/types";
import type { IMarkedCategory } from "@/core/types";
import type { RouteLocationNormalizedLoaded } from "vue-router";

function markActiveCategoryTree(
  category?: Category,
  currentRoute?: RouteLocationNormalizedLoaded,
): IMarkedCategory | undefined {
  if (!category || !currentRoute) {
    return;
  }

  function markRecursively(cat: Category): IMarkedCategory {
    const route = getCategoryRoute(cat);
    const children = cat.childCategories?.map(markRecursively) ?? [];

    const isSelfActive = isActiveRoute(route, currentRoute as RouteLocationNormalizedLoaded);
    const isChildActive = children.some((c) => c.isActive);

    return {
      ...cat,
      childCategories: children,
      isActive: isSelfActive || isChildActive,
    };
  }

  return markRecursively(category);
}

export function useCategory() {
  const loading = ref(false);
  const category = shallowRef<Category>();

  const { catalogId } = globals;

  async function fetchCategory(payload: Omit<ExtendedQueryCategoryArgsType, "storeId">) {
    console.log("fetchCategory", payload);
    loading.value = true;
    try {
      const data = await getCategory(payload);

      category.value = {
        ...data.category,
        childCategories: data.childCategories.childCategories ?? [],
        name: data.category?.name,
        id: data.category?.id || catalogId,
      };
    } catch (e) {
      Logger.error(`${useCategory.name}.${fetchCategory.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    fetchCategory,
    markActiveCategoryTree,
    loading: readonly(loading),
    category: computed(() => category.value),
  };
}
