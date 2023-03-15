import type { Breadcrumb } from "@/xapi/types";

export function buildBreadcrumbs(items?: Breadcrumb[]): IBreadcrumb[] | undefined {
  return items?.map<IBreadcrumb>(({ title, seoPath }) => ({
    title,
    route: seoPath?.startsWith("/") ? seoPath : "/" + seoPath,
  }));
}
