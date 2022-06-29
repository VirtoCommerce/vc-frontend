import { computed, unref } from "vue";
import { MaybeRef } from "@vueuse/core";
import { RouteLocationRaw } from "vue-router";
import { Product } from "@/xapi/types";
import { getProductRoute } from "@/shared/catalog";

export default (products: MaybeRef<Product[]>) => {
  return computed(() =>
    unref(products).reduce<Record<string, RouteLocationRaw>>((result, product) => {
      result[product.id] = getProductRoute(product);
      return result;
    }, {})
  );
};
