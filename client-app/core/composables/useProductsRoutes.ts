import { computed, unref } from "vue";
import { getProductRoute } from "../utilities";
import type { MaybeRef } from "@vueuse/core";
import type { ComputedRef } from "vue";
import type { RouteLocationRaw } from "vue-router";

export function useProductsRoutes(
  products: MaybeRef<Record<string, any>[]>, // eslint-disable-line @typescript-eslint/no-explicit-any
  options: { productIdProperty?: string; slugProperty?: string } = {},
): ComputedRef<Record<string, RouteLocationRaw>> {
  const { productIdProperty = "id", slugProperty = "slug" } = options;

  return computed(() =>
    unref(products).reduce<Record<string, RouteLocationRaw>>((result, item) => {
      result[item[productIdProperty]] = getProductRoute(item[productIdProperty], item[slugProperty]);
      return result;
    }, {}),
  );
}
