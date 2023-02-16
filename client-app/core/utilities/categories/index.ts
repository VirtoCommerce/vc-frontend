import { RouteLocationRaw } from "vue-router";
import { CategoryTreeItem } from "@/core";
import { Category } from "@/xapi";

export function getCategoryRoute(category: Category | CategoryTreeItem): RouteLocationRaw {
  return category.slug ? `/${category.slug}` : { name: "Category", params: { categoryId: category.id } };
}

function categoryToCategoryTreeItem(category: Category, parent: CategoryTreeItem): CategoryTreeItem {
  return { ...category, parent, children: [] };
}

export function buildCategoryTree(parent: CategoryTreeItem, categories: Category[]): CategoryTreeItem {
  parent.children = categories
    .filter((item) => (parent.isRoot && !item.parent?.id) || item.parent?.id === parent.id)
    .map((item) => buildCategoryTree(categoryToCategoryTreeItem(item, parent), categories));

  return parent;
}

export function searchCategoryTreeItemByKey(
  categoryTreeItem: CategoryTreeItem,
  key: keyof CategoryTreeItem,
  value: any
): CategoryTreeItem | undefined {
  if (categoryTreeItem[key] === value) {
    return categoryTreeItem;
  }

  for (const item of categoryTreeItem.children) {
    const category = searchCategoryTreeItemByKey(item, key, value);

    if (category) {
      return category;
    }
  }

  return undefined;
}
