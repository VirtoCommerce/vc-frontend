import { computed, readonly, ref, shallowRef } from "vue";
import { buildCategoryTree, CategoryTreeItem, Logger } from "@/core";
import { searchCategories } from "@/xapi";
import globals from "@/core/globals";

const MAX_CATEGORIES = 9999;

const loading = ref(true);
const categoryTree = shallowRef<CategoryTreeItem>();

async function fetchCategories() {
  loading.value = true;

  try {
    const { items = [] } = await searchCategories(MAX_CATEGORIES, 1);

    categoryTree.value = buildCategoryTree(
      {
        isRoot: true,
        id: globals.catalogId,
        name: globals.i18n.global.t("pages.catalog.title"),
        slug: globals.router.resolve({ name: "Catalog" }).fullPath.slice(1),
        children: [],
        seoInfo: {
          pageTitle: globals.i18n.global.t("pages.catalog.meta.title"),
          metaKeywords: globals.i18n.global.t("pages.catalog.meta.keywords"),
          metaDescription: globals.i18n.global.t("pages.catalog.meta.description"),
        },
      },
      items
    );
  } catch (e) {
    Logger.error(fetchCategories.name, e);
    throw e;
  } finally {
    loading.value = false;
  }
}

export default function useCategories() {
  return {
    fetchCategories,
    loading: readonly(loading),
    categoryTree: computed(() => categoryTree.value),
  };
}
