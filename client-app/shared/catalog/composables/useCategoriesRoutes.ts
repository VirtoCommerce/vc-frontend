import { computed, unref } from "vue";
import { MaybeRef } from "@vueuse/core";
import { RouteLocationRaw } from "vue-router";
import { Category } from "@/xapi/types";
import { CategoryTree, getCategoryRoute } from "@/shared/catalog";

export default (categories: MaybeRef<(Category | CategoryTree)[]>) => {
  return computed(() =>
    unref(categories).reduce<Record<string, RouteLocationRaw>>((result, category) => {
      result[category.id!] = getCategoryRoute(category);
      return result;
    }, {})
  );
};
