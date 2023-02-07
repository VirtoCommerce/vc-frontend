import globals from "@/core/globals";
import { Category, Query, QueryCategoryArgs, QueryChildCategoriesArgs } from "@/xapi/types";
import getCategoryQueryDocument from "./getCategoryQuery.graphql";

function getCatalogHomeCategory(): Category {
  const catalogCode: string = globals.router.resolve({ name: "Catalog" }).fullPath.slice(1);

  return {
    id: globals.catalogId,
    code: catalogCode,
    name: globals.i18n.global.t("pages.catalog.title"),
    slug: catalogCode,
    seoInfo: {
      pageTitle: globals.i18n.global.t("pages.catalog.meta.title"),
      metaKeywords: globals.i18n.global.t("pages.catalog.meta.keywords"),
      metaDescription: globals.i18n.global.t("pages.catalog.meta.description"),
    },
  };
}

export default async function getCategory(payload: QueryChildCategoriesArgs): Promise<Category | undefined> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<
    Required<Pick<Query, "category"> & Pick<Query, "childCategories">>,
    QueryCategoryArgs & QueryChildCategoriesArgs
  >({
    query: getCategoryQueryDocument,
    variables: {
      id: payload.categoryId || globals.catalogId,
      storeId,
      userId,
      cultureName,
      currencyCode,
      categoryId: payload.categoryId,
      maxLevel: payload.maxLevel,
      onlyActive: payload.onlyActive,
    },
  });

  const category = data.category || getCatalogHomeCategory();
  category.childCategories = data.childCategories.childCategories;

  if (payload.categoryId && data.category && !data.category.parent) {
    category.parent = getCatalogHomeCategory();
  }

  return category;
}
