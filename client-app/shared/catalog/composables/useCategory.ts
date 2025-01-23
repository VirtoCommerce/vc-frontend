import { computed, readonly, ref, shallowRef } from "vue";
import { getCategory } from "@/core/api/graphql";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import type { ExtendedQueryCategoryArgsType } from "@/core/api/graphql";
import type { Category } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

const loading = ref(false);
const category = shallowRef<Category>();

export function useCategory() {
  const { catalogId, i18n } = globals;

  const catalogName = i18n.global.t("pages.catalog.title");
  const catalogRoute: RouteLocationRaw = { name: "Catalog" };
  const catalogBreadcrumb: IBreadcrumb = { title: catalogName, route: catalogRoute };

  async function fetchCategory(payload: Omit<ExtendedQueryCategoryArgsType, "storeId">) {
    loading.value = true;
    try {
      const data = await getCategory(payload);

      category.value = {
        ...data.category,
        childCategories: data.childCategories.childCategories ?? [],
        name: data.category?.name ?? catalogName,
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
    catalogBreadcrumb,
    fetchCategory,
    loading: readonly(loading),
    category: computed(() => category.value),
  };
}
