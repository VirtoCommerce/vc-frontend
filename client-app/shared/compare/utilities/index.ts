import { CONFIGURATION_URL_SEARCH_PARAM } from "@/core/constants";
import { getProductRoute } from "@/core/utilities";
import { COMPARE_CATEGORY_DEPTH } from "../constants";
import type { ICompareDisplayProduct } from "../types";
import type { Breadcrumb, PriceType, Product } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

const CATEGORY_BREADCRUMB_TYPE_NAME = "Category";

function getProductCategoryBreadcrumbs(product: Product, depth = COMPARE_CATEGORY_DEPTH): Breadcrumb[] {
  return (product.breadcrumbs ?? [])
    .filter((breadcrumb) => breadcrumb.typeName === CATEGORY_BREADCRUMB_TYPE_NAME)
    .slice(0, depth);
}

export function getProductCategoryKey(product: Product, depth = COMPARE_CATEGORY_DEPTH): string {
  return getProductCategoryBreadcrumbs(product, depth)
    .map((breadcrumb) => breadcrumb.itemId)
    .join("/");
}

export function getProductCategoryLabel(product: Product, depth = COMPARE_CATEGORY_DEPTH): string {
  const categoryBreadcrumbs = getProductCategoryBreadcrumbs(product, depth);
  return categoryBreadcrumbs.at(-1)?.title ?? "";
}

export function getDisplayPrice(product: Product): PriceType {
  return product.hasVariations && product.minVariationPrice ? product.minVariationPrice : product.price;
}

export function getConfigurationLink(item: ICompareDisplayProduct): RouteLocationRaw {
  const route = getProductRoute(item.product.id, item.product.slug);
  const routeAsObject = typeof route === "string" ? { path: route } : route;

  return {
    ...routeAsObject,
    query: {
      ...routeAsObject.query,
      ...(item.entry.localId ? { [CONFIGURATION_URL_SEARCH_PARAM]: item.entry.localId } : {}),
    },
  };
}
