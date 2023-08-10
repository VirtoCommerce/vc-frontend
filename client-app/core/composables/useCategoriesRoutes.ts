import { computed, unref } from "vue";
import { getCategoryRoute } from "../utilities";
import type { CategoryTreeItemType } from "../types";
import type { Category } from "@/core/api/graphql/types";
import type { MaybeRef } from "@vueuse/core";
import type { RouteLocationRaw } from "vue-router";

export function useCategoriesRoutes(categories: MaybeRef<(Category | CategoryTreeItemType)[]>) {
  return computed(() =>
    unref(categories).reduce<Record<string, RouteLocationRaw>>((result, category) => {
      result[category.id] = getCategoryRoute(category);
      return result;
    }, {}),
  );
}
