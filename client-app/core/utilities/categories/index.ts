import { ROUTES } from "@/router/routes/constants";
import type { Category } from "@/core/api/graphql/types";
import type { RouteLocationRaw, LocationQueryRaw } from "vue-router";

export function getCategoryRoute(
  category: Pick<Category, "id" | "slug">,
  query?: LocationQueryRaw,
  basePath?: string,
): RouteLocationRaw {
  const queryPart = query && Object.keys(query).length > 0 ? { query } : {};
  const normalizedBasePath = basePath?.replace(/\/$/, "") ?? "";

  if (category.slug) {
    return {
      path: `${normalizedBasePath}/${category.slug}`,
      ...queryPart,
    };
  }

  const isLoyaltyCatalog = normalizedBasePath === ROUTES.LOYALTY_CATALOG.PATH;
  return {
    name: isLoyaltyCatalog ? ROUTES.LOYALTY_CATEGORY.NAME : "Category",
    params: { categoryId: category.id },
    ...queryPart,
  };
}
