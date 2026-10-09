import { computed, toValue, unref } from "vue";
import { getCategoryRoute } from "../utilities";
import type { Category } from "@/core/api/graphql/types";
import type { ReadonlyRefOrGetter } from "@vueuse/core";
import type { MaybeRef } from "vue";
import type { LocationQueryRaw, RouteLocationRaw } from "vue-router";

export function useCategoriesRoutes(
  categories: MaybeRef<Pick<Category, "id" | "slug">[]>,
  query?: ReadonlyRefOrGetter<LocationQueryRaw>,
  basePath?: ReadonlyRefOrGetter<string>,
) {
  return computed(() =>
    unref(categories).reduce<Record<string, RouteLocationRaw>>((result, category) => {
      result[category.id] = getCategoryRoute(category, toValue(query), toValue(basePath));
      return result;
    }, {}),
  );
}
