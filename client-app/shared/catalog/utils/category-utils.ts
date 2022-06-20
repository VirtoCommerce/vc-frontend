import { Category } from "@/xapi/types";
import { RouteLocationRaw } from "vue-router";

export function getCategoryRoute(category: Category): RouteLocationRaw {
  return category.slug ? `/${category.slug}` : { name: "Category", params: { categoryId: category.id } };
}
