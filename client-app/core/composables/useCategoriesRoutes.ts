import type { MaybeRef } from "@vueuse/core";
import { computed, unref } from "vue";
import type { RouteLocationRaw } from "vue-router";
import type { Category } from "@/xapi/types";
import type { CategoryTreeItemType } from "../types";
import { getCategoryRoute } from "../utilities";

export function useCategoriesRoutes(categories: MaybeRef<(Category | CategoryTreeItemType)[]>) {
  return computed(() =>
    unref(categories).reduce<Record<string, RouteLocationRaw>>((result, category) => {
      result[category.id] = getCategoryRoute(category);
      return result;
    }, {})
  );
}
