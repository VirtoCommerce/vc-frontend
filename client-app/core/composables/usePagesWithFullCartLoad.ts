import { reactive, readonly } from "vue";
import type { RouteRecordName } from "vue-router";

const routeNames = reactive<Set<RouteRecordName>>(new Set());

export function usePagesWithFullCartLoad() {
  function registerPagesWithFullCartLoad(...items: RouteRecordName[]): void {
    items.forEach((item) => routeNames.add(item));
  }

  return {
    registerPagesWithFullCartLoad,
    pagesWithFullCartLoad: readonly(routeNames),
  };
}
