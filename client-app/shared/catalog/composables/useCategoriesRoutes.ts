import { computed, unref } from "vue";
import { MaybeRef } from "@vueuse/core";
import { RouteLocationRaw } from "vue-router";
import { Category } from "@core/api/graphql/types";
import { getCategoryRoute } from "@/shared/catalog";

export default (categories: MaybeRef<Category[]>) => {
  return computed(() =>
    unref(categories).reduce<Record<string, RouteLocationRaw>>((result, category) => {
      result[category.id] = getCategoryRoute(category);
      return result;
    }, {})
  );
};
