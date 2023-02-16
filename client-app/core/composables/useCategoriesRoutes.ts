import { MaybeRef } from "@vueuse/core";
import { computed, unref } from "vue";
import { RouteLocationRaw } from "vue-router";
import { CategoryTreeItem, getCategoryRoute } from "@/core";
import { Category } from "@/xapi";

export default (categories: MaybeRef<(Category | CategoryTreeItem)[]>) => {
  return computed(() =>
    unref(categories).reduce<Record<string, RouteLocationRaw>>((result, category) => {
      result[category.id] = getCategoryRoute(category);
      return result;
    }, {})
  );
};
