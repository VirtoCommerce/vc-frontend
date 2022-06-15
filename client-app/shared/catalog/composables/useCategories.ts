import { computed, readonly, Ref, ref } from "vue";
import { searchCategories } from "@/xapi/graphql/catalog";
import { Category } from "@/xapi/graphql/types";
import { Logger } from "@core/utilities";
import { CategoryTree } from "../types";

const categoryTree: Ref<CategoryTree> = ref({});
const loading: Ref<boolean> = ref(true);

const itemToTree = (category: Category, isCurrent: boolean): CategoryTree => {
  return {
    id: category.id,
    parent: category.parent?.id ?? "",
    label: category.name ?? "",
    slug: category.slug ?? "",
    items: [],
    isCurrent,
    seoUrl: category.seoInfo?.semanticUrl ?? "",
    breadcrumbs: category.breadcrumbs,
  };
};

const buildCategoryTree = (parent: CategoryTree, allCats: Category[], activeCatId: string): CategoryTree => {
  //TODO: replace to loop instead of recursion
  parent.items = allCats
    .filter((c) => c.id !== parent.id && c.parent?.id === parent.id)
    // .sort((a, b) => (a.outline ?? "").localeCompare(b.outline ?? ""))
    .map((c) => {
      return buildCategoryTree(itemToTree(c, activeCatId === c.id), allCats, activeCatId);
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

async function loadCategoriesTree(activeCatId: string) {
  const MAX_CATEGORIES = 100;
  loading.value = true;

  try {
    const { items = [] } = await searchCategories(MAX_CATEGORIES, 1);
    categoryTree.value = buildCategoryTree({}, items, activeCatId);
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
    selectedCategory.value = value ? searchCategoryByKey(categoryTree.value, key, value) : undefined;
  }

  return {
    selectCategoryByKey,
    loadCategoriesTree,
    loading: readonly(loading),
    categoryTree: computed(() => categoryTree.value),
    selectedCategory: computed(() => selectedCategory.value),
  };
};
