import { computed, readonly, Ref, ref } from "vue";
import { searchCategories } from "@core/api/graphql/catalog";
import { Category } from "@core/api/graphql/types";
import { Logger } from "@core/utilities";
import { CategoryTree } from "../types";

const categoryTree: Ref<CategoryTree> = ref({});
const loading: Ref<boolean> = ref(true);
const selectedCategory: Ref<CategoryTree | undefined> = ref();

const itemToTree = (category: Category, isCurrent: boolean): CategoryTree => {
  return {
    id: category.id,
    parent: category.parent?.id ?? "",
    label: category.name ?? "",
    slug: category.slug ?? "",
    items: [],
    isCurrent,
    seoUrl: category.seoInfo?.semanticUrl ?? "",
  };
};

const buildCategoryTree = (parent: CategoryTree, allCats: Category[], activeCatId: string): CategoryTree => {
  //TODO: replace to loop instead of recursion
  parent.items = allCats
    .filter((c) => c.id != parent.id && c.parent?.id === parent.id)
    // .sort((a, b) => (a.outline ?? "").localeCompare(b.outline ?? ""))
    .map((c) => {
      return buildCategoryTree(itemToTree(c, activeCatId === c.id), allCats, activeCatId);
    });

  return parent;
};

function searchCategory(categoryTreeItem: CategoryTree, seoUrl: string): CategoryTree | undefined {
  const items = categoryTreeItem.items ?? [];
  let category = items.find((item) => item.seoUrl === seoUrl);

  if (category) {
    return category;
  }

  for (const item of items) {
    category = searchCategory(item, seoUrl);

    if (category) {
      break;
    }
  }

  return category;
}

function selectCategoryBySeoUrl(seoUrl?: string) {
  selectedCategory.value = seoUrl ? searchCategory(categoryTree.value, seoUrl) : undefined;
}

async function loadCategoriesTree(activeCatId: string) {
  loading.value = true;

  try {
    const { items = [] } = await searchCategories(100, 1);
    categoryTree.value = buildCategoryTree({}, items, activeCatId);
  } catch (e) {
    Logger.error("useCategories.loadCategoriesTree", e);
    throw e;
  } finally {
    loading.value = false;
  }
}

export default () => ({
  selectCategoryBySeoUrl,
  loadCategoriesTree,
  loading: readonly(loading),
  categoryTree: computed(() => categoryTree.value),
  selectedCategory: computed(() => selectedCategory.value),
});
