import { computed, toValue, unref } from "vue";
import { getCategoryRoute } from "../utilities";
import type { Category } from "@/core/api/graphql/types";
import type { MaybeRef, ReadonlyRefOrGetter } from "@vueuse/core";
import type { LocationQueryRaw, RouteLocationRaw } from "vue-router";

export function useCategoriesRoutes(
  categories: MaybeRef<Pick<Category, "id" | "slug">[]>,
  query?: ReadonlyRefOrGetter<LocationQueryRaw>,
) {
  return computed(() =>
    unref(categories).reduce<Record<string, RouteLocationRaw>>((result, category) => {
      result[category.id] = getCategoryRoute(category, toValue(query));
      return result;
    }, {}),
  );
}
