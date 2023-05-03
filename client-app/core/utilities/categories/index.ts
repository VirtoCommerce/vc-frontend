import type { CategoryTreeItemType } from "../../types";
import type { Category } from "@/xapi/types";
import type { RouteLocationRaw } from "vue-router";

export function getCategoryRoute(category: Category | CategoryTreeItemType): RouteLocationRaw {
  return category.slug ? `/${category.slug}` : { name: "Category", params: { categoryId: category.id } };
}

function categoryToCategoryTreeItem(category: Category, parent: CategoryTreeItemType): CategoryTreeItemType {
  return { ...category, parent, children: [] };
}

export function buildCategoryTree(parent: CategoryTreeItemType, categories: Category[]): CategoryTreeItemType {
  parent.children = categories
    .filter((item) => (parent.isRoot && !item.parent?.id) || item.parent?.id === parent.id)
    .map((item) => buildCategoryTree(categoryToCategoryTreeItem(item, parent), categories));

  return parent;
}
