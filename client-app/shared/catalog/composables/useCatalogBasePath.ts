import { computed } from "vue";
import { useRoute } from "vue-router";
import { ROUTES } from "@/router/routes/constants";

/**
 * Returns the catalog-specific URL prefix for the given pathname.
 * - For `/loyalty-catalog` and `/loyalty-catalog/<slug>` it returns `/loyalty-catalog`.
 * - Otherwise it returns an empty string.
 *
 * Pure helper so it can be used outside Vue components (e.g. when manipulating
 * the URL via history.replaceState in non-reactive contexts).
 */
export function getCatalogBasePath(pathname: string): string {
  const loyaltyPath = ROUTES.LOYALTY_CATALOG.PATH;
  if (pathname === loyaltyPath || pathname.startsWith(`${loyaltyPath}/`)) {
    return loyaltyPath;
  }
  return "";
}

/**
 * Reactive variant of {@link getCatalogBasePath} bound to the current vue-router route.
 * Used to preserve the catalog namespace when generating product/category links.
 */
export function useCatalogBasePath() {
  const route = useRoute();
  return computed(() => getCatalogBasePath(route.path));
}
