import type { Router } from "vue-router";

/**
 * The path to store for a page. A route with parameters of its own is stored as its pattern: `/shared-list/:sharingKey`
 * carries a key that opens the list, and an order or a quote id tells a report nothing. A catalog or content URL has
 * no such parameter and is stored as it is.
 */
export function getPagePath(router: Router, path: string = location.pathname): string {
  const route = router.resolve(path);
  const hasOwnParams = Object.keys(route.params).some((name) => name !== "pathMatch");

  return (hasOwnParams && route.matched.at(-1)?.path) || route.path;
}
