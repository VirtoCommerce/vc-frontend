import { computed, readonly, ref } from "vue";
import { searchCategories } from "@/xapi/graphql/catalog";
import { Category } from "@/xapi/types";
import { Logger } from "@/core/utilities";
import { CategoryTree } from "../types";
import globals from "@/core/globals";

const loading = ref(true);
const categoryTree = ref<CategoryTree>();

const itemToTreeItem = (parent: CategoryTree, category: Category): CategoryTree => {
  return {
    isRoot: false,
    id: category.id,
    parent: parent,
    parentId: category.parent?.id ?? "",
    label: category.name ?? "",
    slug: category.slug ?? "",
    items: [],
    seoUrl: category.seoInfo?.semanticUrl ?? "",
    seoInfo: category.seoInfo,
    breadcrumbs: category.breadcrumbs,
  };
};

const buildCategoryTree = (parent: CategoryTree, allCats: Category[]): CategoryTree => {
  parent.items = allCats
    .filter((categoryItem) => categoryItem.id !== parent.id && categoryItem.parent?.id === parent.id)
    .map((c) => {
      return buildCategoryTree(itemToTreeItem(parent, c), allCats);
    });

  return parent;
};

async function fetchCategoriesTree() {
  const MAX_CATEGORIES = 100;
  loading.value = true;

  const rootCategoryInitialValue: CategoryTree = {
    isRoot: true,
    label: globals.i18n.global.t("pages.catalog.title"),
    items: [],
    slug: "catalog",
    breadcrumbs: [],
    seoInfo: {
      pageTitle: globals.i18n.global.t("pages.catalog.meta.title"),
      metaKeywords: globals.i18n.global.t("pages.catalog.meta.keywords"),
      metaDescription: globals.i18n.global.t("pages.catalog.meta.description"),
    },
  };

  try {
    const { items = [] } = await searchCategories(MAX_CATEGORIES, 1);
    categoryTree.value = buildCategoryTree(rootCategoryInitialValue, items);
  } catch (e) {
    Logger.error("useCategories.loadCategoriesTree", e);
    throw e;
  } finally {
    loading.value = false;
  }
}

export default () => {
  return {
    fetchCategoriesTree,
    loading: readonly(loading),
    categoryTree: computed(() => categoryTree.value),
  };
};
