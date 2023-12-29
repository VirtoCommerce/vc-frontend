import type { Product } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

export function getProductRoute(productId: string, productSlug?: string): RouteLocationRaw {
  return productSlug ? `/${productSlug}` : { name: "Product", params: { productId } };
}

export function productHasVariations(product?: Product): boolean {
  return !!product && product.hasVariations && !!product.variations?.length;
}
