import { Breadcrumb } from "@/xapi";

export function buildBreadcrumbs(xapiBreadcrumbs?: Breadcrumb[]): IBreadcrumb[] | undefined {
  return xapiBreadcrumbs?.map<IBreadcrumb>(({ title, seoPath }) => ({
    title,
    route: seoPath?.startsWith("/") ? seoPath : "/" + seoPath,
  }));
}
