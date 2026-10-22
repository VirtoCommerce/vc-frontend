import { ROUTES } from "@/router/routes/constants";
import type { RouteLocationRaw } from "vue-router";

export function getProductRoute(productId: string, productSlug?: string, basePath?: string): RouteLocationRaw;
export function getProductRoute(
  productId?: string,
  productSlug?: string,
  basePath?: string,
): RouteLocationRaw | undefined {
  if (!productSlug) {
    if (!productId) {
      return undefined;
    }
    const isLoyaltyCatalog = basePath?.replace(/\/$/, "") === ROUTES.LOYALTY_CATALOG.PATH;
    return isLoyaltyCatalog
      ? { name: ROUTES.LOYALTY_PRODUCT.NAME, params: { productId } }
      : { name: "Product", params: { productId } };
  }
  const prefix = basePath?.replace(/\/$/, "") ?? "";
  return `${prefix}/${productSlug}`;
}

export function getProductListIndex(products: { id: string }[], productId: string): number | undefined {
  const index = products.findIndex(({ id }) => id === productId);
  return index === -1 ? undefined : index;
}
