import { useI18n } from "vue-i18n";
import { MaybeRef } from "@vueuse/core";
import { computed, Ref, unref } from "vue";

interface UseBreadcrumbs {
  breadcrumbs: Ref<IBreadcrumb[]>;
}

export function useBreadcrumbs(breadcrumbs: MaybeRef<IBreadcrumb[]>): UseBreadcrumbs {
  const { t } = useI18n();

  return {
    breadcrumbs: computed(() => {
      const result = unref(breadcrumbs);
      return [{ route: "/", title: t("common.links.home") }, ...result];
    }),
  };
}
