import { CategoryTree } from "@/shared/catalog";
import { Category } from "@/xapi/graphql/types";
import { RouteLocationRaw } from "vue-router";

export function getCategoryRoute(category: Category | CategoryTree): RouteLocationRaw {
  return category.slug ? `/${category.slug}` : { name: "Category", params: { categoryId: category.id } };
}
