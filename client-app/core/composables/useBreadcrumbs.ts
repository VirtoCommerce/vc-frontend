import { useI18n } from "vue-i18n";
import { Breadcrumb } from "@/xapi/types";
import { MaybeRef } from "@vueuse/core";
import { computed, Ref, unref } from "vue";

export interface UseBreadcrumbs {
  breadcrumbs: Ref<ReadonlyArray<Readonly<IBreadcrumb>>>;
}

export function useBreadcrumbs(
  breadcrumbs: MaybeRef<ReadonlyArray<Readonly<IBreadcrumb>>>,
  nativeBreadcrumbs?: MaybeRef<ReadonlyArray<Readonly<Breadcrumb>> | undefined>
): UseBreadcrumbs {
  const { t } = useI18n();

  return {
    breadcrumbs: computed(() => {
      const result =
        unref(nativeBreadcrumbs)?.map((nativeBreadcrumb) => ({
          title: nativeBreadcrumb.title,
          route: `/${nativeBreadcrumb.seoPath}`,
        })) ?? unref(breadcrumbs);
      return [{ route: "/", title: t("common.links.home") }, ...result];
    }),
  };
}
