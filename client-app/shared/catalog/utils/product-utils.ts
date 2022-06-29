import { Product, VariationType } from "@/xapi/types";
import { RouteLocationRaw } from "vue-router";

export function getProductRoute(product: Product | VariationType): RouteLocationRaw {
  return product.slug ? `/${product.slug}` : { name: "Product", params: { productId: product.id } };
}
