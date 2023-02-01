import { useI18n } from "vue-i18n";
import { MaybeRef } from "@vueuse/core";
import { computed, ComputedRef, unref } from "vue";

export function useBreadcrumbs(breadcrumbs: MaybeRef<IBreadcrumb[]>): ComputedRef<IBreadcrumb[]> {
  const { t } = useI18n();

  return computed(() => {
    const result = unref(breadcrumbs);
    return [{ route: "/", title: t("common.links.home") }, ...result];
  });
}
