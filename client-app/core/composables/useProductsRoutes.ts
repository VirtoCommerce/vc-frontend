import { MaybeRef } from "@vueuse/core";
import { computed, ComputedRef, unref } from "vue";
import { RouteLocationRaw } from "vue-router";
import { getProductRoute } from "@/core";

export default function useProductsRoutes(
  products: MaybeRef<Record<string, any>[]>,
  options: { productIdProperty?: string; slugProperty?: string } = {}
): ComputedRef<Record<string, RouteLocationRaw>> {
  const { productIdProperty = "id", slugProperty = "slug" } = options;

  return computed(() =>
    unref(products).reduce<Record<string, RouteLocationRaw>>((result, item) => {
      result[item[productIdProperty]] = getProductRoute(item[productIdProperty], item[slugProperty]);
      return result;
    }, {})
  );
}
