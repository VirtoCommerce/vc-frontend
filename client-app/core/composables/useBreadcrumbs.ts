import { useI18n } from "vue-i18n";
import { isFunction, MaybeRef } from "@vueuse/core";
import { computed, ComputedRef, unref } from "vue";

/**
 * Adds a link element to the home page at the beginning of the array.
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

  const homepage: IBreadcrumb = { title: t("common.links.home"), route: "/" };
  const breadcrumbs: MaybeRef<IBreadcrumb[]> = isFunction(sources) ? computed(sources) : sources;

  return computed(() => [homepage].concat(unref(breadcrumbs)));
}
