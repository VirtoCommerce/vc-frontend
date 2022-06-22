import { computed, readonly, Ref, ref } from "vue";
import { searchCategories } from "@/xapi/graphql/catalog";
import { Category } from "@/xapi/graphql/types";
import { Logger } from "@core/utilities";
import { CategoryTree } from "../types";
import globals from "@core/globals";

const categoryTree: Ref<CategoryTree | undefined> = ref();
const loading: Ref<boolean> = ref(true);

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

function searchCategoryByKey(
  categoryTreeItem: CategoryTree,
  key: keyof CategoryTree,
  value: any
): CategoryTree | undefined {
  const items = categoryTreeItem.items ?? [];
  let category = items.find((item) => item[key] === value);

  if (category) {
    return category;
  }

  for (const item of items) {
    category = searchCategoryByKey(item, key, value);

    if (category) {
      break;
    }
  }

  return category;
}

async function loadCategoriesTree() {
  const MAX_CATEGORIES = 100;
  loading.value = true;

  const rootCategoryInitialValue: CategoryTree = {
    isRoot: true,
    label: globals.i18n.global.t("common.labels.catalog"),
    items: [],
    slug: "catalog",
    breadcrumbs: [],
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
  const selectedCategory: Ref<CategoryTree | undefined> = ref();

  function selectCategoryByKey(key: keyof CategoryTree, value: any) {
    selectedCategory.value = value ? searchCategoryByKey(categoryTree.value!, key, value) : undefined;
  }

  function selectRoot() {
    selectedCategory.value = categoryTree.value;
  }

  return {
    selectRoot,
    selectCategoryByKey,
    loadCategoriesTree,
    loading: readonly(loading),
    categoryTree: computed(() => categoryTree.value),
    selectedCategory: computed(() => selectedCategory.value),
  };
};
