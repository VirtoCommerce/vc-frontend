import { computed, readonly, ref, shallowRef } from "vue";
import { getCategory } from "@/core/api/graphql";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import type { ExtendedQueryCategoryArgsType } from "@/core/api/graphql";
import type { Category } from "@/core/api/graphql/types";

export function useCategory() {
  const loading = ref(false);
  const category = shallowRef<Category>();

  const { catalogId, i18n, router } = globals;

  const rootCategory: Readonly<Category> = {
    id: catalogId,
    name: i18n.global.t("pages.catalog.title"),
    slug: router.resolve({ name: "Catalog" }).fullPath.slice(1),
    code: "",
    priority: 0,
    breadcrumbs: [],
    seoInfo: {
      pageTitle: i18n.global.t("pages.catalog.meta.title"),
      metaKeywords: i18n.global.t("pages.catalog.meta.keywords"),
      metaDescription: i18n.global.t("pages.catalog.meta.description"),
    },
  };

  async function fetchCategory(payload: ExtendedQueryCategoryArgsType) {
    loading.value = true;
    try {
      const data = await getCategory(payload);
      const parent = data.category && !data.category.parent ? rootCategory : data.category.parent;

      category.value = {
        ...(data.category ?? rootCategory),
        parent,
        childCategories: data.childCategories.childCategories,
      };
    } catch (e) {
      Logger.error(`${useCategory.name}.${fetchCategory.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    rootCategory,
    fetchCategory,
    loading: readonly(loading),
    category: computed(() => category.value),
  };
}
