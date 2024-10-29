import type { RouteLocationRaw } from "vue-router";

export function getProductRoute(productId: string, productSlug?: string): RouteLocationRaw;
export function getProductRoute(productId?: string, productSlug?: string): RouteLocationRaw | undefined {
  const defaultRoute = productId ? { name: "Product", params: { productId } } : undefined;
  return productSlug ? `/${productSlug}` : defaultRoute;
}
