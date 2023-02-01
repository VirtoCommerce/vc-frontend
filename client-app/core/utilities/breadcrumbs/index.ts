import { Breadcrumb } from "@/xapi";
import { MaybeRef } from "@vueuse/core";
import { unref } from "vue";

export function buildBreadcrumbs(xapiBreadcrumbsRef: MaybeRef<Breadcrumb[] | undefined>): IBreadcrumb[] | undefined {
  const xapiBreadcrumbs = unref(xapiBreadcrumbsRef);
  if (xapiBreadcrumbs && xapiBreadcrumbs.length) {
    return xapiBreadcrumbs.map((xapiBreadcrumb) => ({
      title: xapiBreadcrumb.title,
      route: `/${xapiBreadcrumb.seoPath}`,
    }));
  }
  return undefined;
}
