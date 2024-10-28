import type { RouteLocationRaw } from "vue-router";

export function getProductRoute(productId: string, productSlug?: string): RouteLocationRaw;
export function getProductRoute(productId?: string, productSlug?: string): RouteLocationRaw | undefined {
  return productSlug ? `/${productSlug}` : productId ? { name: "Product", params: { productId } } : undefined;
}
