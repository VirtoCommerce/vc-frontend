import type { CategoryTreeItemType } from "../../types";
import type { Category } from "@/xapi/types";
import type { RouteLocationRaw } from "vue-router";

export function getCategoryRoute(category: Category | CategoryTreeItemType): RouteLocationRaw {
  return category.slug ? `/${category.slug}` : { name: "Category", params: { categoryId: category.id } };
}
