import type { Category } from "@/core/api/graphql/types";
import type { RouteLocationRaw, LocationQueryRaw } from "vue-router";

export function getCategoryRoute(category: Pick<Category, "id" | "slug">, query?: LocationQueryRaw): RouteLocationRaw {
  if (category.slug) {
    return {
      path: `/${category.slug}`,
      query,
    };
  }

  return {
    name: "Category",
    params: { categoryId: category.id },
    query,
  };
}
