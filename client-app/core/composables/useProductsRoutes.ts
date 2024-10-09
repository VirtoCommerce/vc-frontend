import { computed, unref } from "vue";
import { getProductRoute } from "../utilities";
import type { MaybeRef } from "@vueuse/core";
import type { ComputedRef } from "vue";
import type { RouteLocationRaw } from "vue-router";

export function useProductsRoutes(
  products: MaybeRef<Record<string, unknown>[]>,
  options: { productIdProperty?: string; slugProperty?: string } = {},
): ComputedRef<Record<string, RouteLocationRaw>> {
  const { productIdProperty = "id", slugProperty = "slug" } = options;

  return computed(() =>
    unref(products).reduce<Record<string, RouteLocationRaw>>((result, item) => {
      const productId = item[productIdProperty] as string | undefined;
      const productSlug = item[slugProperty] as string | undefined;
      if (!productId) {
        return result;
      }
      result[productId] = getProductRoute(productId, productSlug);
      return result;
    }, {}),
  );
}
