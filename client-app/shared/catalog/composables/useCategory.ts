import { computed, readonly, ref, shallowRef, toValue } from "vue";
import { getCategory } from "@/core/api/graphql";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import type { ExtendedQueryCategoryArgsType } from "@/core/api/graphql";
import type { Category } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useCategory(options: { currencyCodeOverride?: MaybeRefOrGetter<string | undefined> } = {}) {
  const loading = ref(false);
  const category = shallowRef<Category>();

  const { catalogId } = globals;

  async function fetchCategory(payload: Omit<ExtendedQueryCategoryArgsType, "storeId">) {
    loading.value = true;
    try {
      const data = await getCategory(payload, { currencyCodeOverride: toValue(options.currencyCodeOverride) });

      if (data) {
        category.value = {
          ...data.category,
          childCategories: data.childCategories.childCategories ?? [],
          name: data.category?.name,
          id: data.category?.id || catalogId,
        };

        return data;
      } else {
        resetState();
      }
    } catch (e) {
      Logger.error(`${useCategory.name}.${fetchCategory.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function resetState() {
    loading.value = false;
    category.value = undefined;
  }

  return {
    fetchCategory,
    loading: readonly(loading),
    category: computed(() => category.value),
  };
}
