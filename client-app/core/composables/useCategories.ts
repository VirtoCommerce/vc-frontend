import { computed, readonly, ref, shallowRef } from "vue";
import { buildCategoryTree, CategoryTreeItem, Logger, useThemeContext } from "@/core";
import globals from "@/core/globals";
import { searchCategories } from "@/xapi";

const loading = ref(true);
const categoryTree = shallowRef<CategoryTreeItem>();

export default function useCategories() {
  const { themeContext } = useThemeContext();

  async function fetchCategories(): Promise<void> {
    try {
      loading.value = true;

      const { items = [] } = await searchCategories(themeContext.value.settings.categories_limit ?? 499, 1);

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
      Logger.error(`${useCategories.name}.${fetchCategories.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    fetchCategories,
    loading: readonly(loading),
    categoryTree: computed(() => categoryTree.value),
  };
}
