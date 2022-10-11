import { CategoryTree } from "@/shared/catalog";
import { Category } from "@/xapi/types";
import { RouteLocationRaw } from "vue-router";

export function getCategoryRoute(category: Category | CategoryTree): RouteLocationRaw {
  return category.slug ? `/${category.slug}` : { name: "Category", params: { categoryId: category.id } };
}

export function searchCategoryByKey(
  categoryTreeItem: CategoryTree,
  key: keyof CategoryTree,
  value: any
): CategoryTree | undefined {
  if (categoryTreeItem[key] === value) {
    return categoryTreeItem;
  }

  const items = categoryTreeItem.items ?? [];

  for (const item of items) {
    const category = searchCategoryByKey(item, key, value);

    if (category) {
      return category;
    }
  }

  return undefined;
}
