import { computed, unref } from "vue";
import { MaybeRef } from "@vueuse/core";
import { RouteLocationRaw } from "vue-router";
import { Category } from "@/xapi";
import { CategoryTreeItem, getCategoryRoute } from "@/core";

export default (categories: MaybeRef<(Category | CategoryTreeItem)[]>) => {
  return computed(() =>
    unref(categories).reduce<Record<string, RouteLocationRaw>>((result, category) => {
      result[category.id] = getCategoryRoute(category);
      return result;
    }, {})
  );
};
