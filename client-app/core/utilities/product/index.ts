import type { RouteLocationRaw } from "vue-router";

export function getProductRoute(productId: string, productSlug?: string, basePath?: string): RouteLocationRaw;
export function getProductRoute(
  productId?: string,
  productSlug?: string,
  basePath?: string,
): RouteLocationRaw | undefined {
  const defaultRoute = productId ? { name: "Product", params: { productId } } : undefined;
  if (!productSlug) {
    return defaultRoute;
  }
  const prefix = basePath?.replace(/\/$/, "") ?? "";
  return `${prefix}/${productSlug}`;
}
