import { computed, readonly, ref, shallowRef } from "vue";
import { getCategory } from "@/core/api/graphql/catalog/queries/getCategory";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import type { ExtendedQueryCategoryArgsType } from "@/core/api/graphql/catalog/queries/getCategory";
import type { Category } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

export function useCategory() {
  const loading = ref(false);
  const category = shallowRef<Category>();

  const { catalogId, i18n, router } = globals;

  const catalogName = i18n.global.t("pages.catalog.title");
  const catalogRoute: RouteLocationRaw = { name: "Catalog" };
  const catalogUrl = router.resolve(catalogRoute).fullPath.slice(1);
  const catalogBreadcrumb: IBreadcrumb = { title: catalogName, route: catalogRoute };

  // FIXME: Don't use fake XAPI object
  const catalog: Readonly<Category> = {
    id: catalogId,
    name: catalogName,
    slug: catalogUrl,
    code: "",
    priority: 0,
    breadcrumbs: [],
    childCategories: [],
    descriptions: [],
    hasParent: false,
    images: [],
    level: 0,
    outlines: [],
    properties: [],
    seoInfo: {
      id: "",
      isActive: true,
      objectId: catalogId,
      objectType: "Catalog",
      semanticUrl: catalogUrl,
      pageTitle: catalogName,
      metaKeywords: i18n.global.t("pages.catalog.meta.keywords"),
      metaDescription: i18n.global.t("pages.catalog.meta.description"),
    },
  };

  async function fetchCategory(payload: Omit<ExtendedQueryCategoryArgsType, "storeId">) {
    loading.value = true;
    try {
      const data = await getCategory(payload);
      const parent = data.category && !data.category.parent ? catalog : data.category?.parent;

      category.value = {
        ...(data.category ?? catalog),
        parent,
        childCategories: data.childCategories.childCategories ?? [],
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
    catalog,
    /** @deprecated Use {@link catalog} instead. */
    rootCategory: catalog,
    fetchCategory,
    loading: readonly(loading),
    category: computed(() => category.value),
  };
}
