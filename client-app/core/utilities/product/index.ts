import type { RouteLocationRaw } from "vue-router";

export function getProductRoute(productId: string, productSlug?: string): RouteLocationRaw {
  return productSlug ? `/${productSlug}` : { name: "Product", params: { productId } };
}
