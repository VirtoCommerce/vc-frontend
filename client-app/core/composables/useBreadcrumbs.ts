import { computed, unref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { ROUTES } from "@/router/routes/constants";
import type { ComputedRef, MaybeRef } from "vue";

/**
 * Adds a link element to the home page at the beginning of the array.
 * When the current route is under a known catalog namespace (e.g. `/loyalty-catalog/<slug>`),
 * also prepends a link back to that namespace root.
 *
 * @example
 * // For non-reactive data
 * const breadcrumbs = useBreadcrumbs([{ title: "Test", route: "/test" }]);
 *
 * // For reactive data
 * const breadcrumbs = useBreadcrumbs(() => [
 *   { title: "Orders", route: { name: "Orders" } },
 *   { title: `Order #${order.value.number}` },
 * ]);
 */
export function useBreadcrumbs(sources: (() => IBreadcrumb[]) | MaybeRef<IBreadcrumb[]>): ComputedRef<IBreadcrumb[]> {
  const { t } = useI18n();
  const route = useRoute();

  const homepage: IBreadcrumb = { title: t("common.links.home"), route: "/" };
  const breadcrumbs: MaybeRef<IBreadcrumb[]> = typeof sources === "function" ? computed(sources) : sources;

  const loyaltyCatalogCrumb = computed<IBreadcrumb | undefined>(() => {
    const loyaltyPath = ROUTES.LOYALTY_CATALOG.PATH;
    return route.path.startsWith(`${loyaltyPath}/`)
      ? { title: t("common.links.loyalty_catalog"), route: loyaltyPath }
      : undefined;
  });

  return computed(() => {
    const prefix = loyaltyCatalogCrumb.value ? [homepage, loyaltyCatalogCrumb.value] : [homepage];
    return prefix.concat(unref(breadcrumbs));
  });
}
