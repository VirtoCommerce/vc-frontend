import { RouteLocationRaw } from "vue-router";
import { Category } from "@/xapi";

export function getCategoryRoute(category: Category): RouteLocationRaw {
  return category.slug ? `/${category.slug}` : { name: "Category", params: { categoryId: category.id } };
}
