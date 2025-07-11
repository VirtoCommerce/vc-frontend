import type { Category } from "@/core/api/graphql/types";
import type { RouteLocationRaw, LocationQueryRaw } from "vue-router";

export function getCategoryRoute(category: Pick<Category, "id" | "slug">, query?: LocationQueryRaw): RouteLocationRaw {
  const queryPart = query && Object.keys(query).length > 0 ? { query } : {};

  if (category.slug) {
    return {
      path: `/${category.slug}`,
      ...queryPart,
    };
  }

  return {
    name: "Category",
    params: { categoryId: category.id },
    ...queryPart,
  };
}
