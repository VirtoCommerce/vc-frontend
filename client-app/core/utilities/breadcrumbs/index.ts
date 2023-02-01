import { Breadcrumb } from "@/xapi";

export function buildBreadcrumbs(xapiBreadcrumbs: Breadcrumb[] | undefined): IBreadcrumb[] | undefined {
  if (xapiBreadcrumbs && xapiBreadcrumbs.length) {
    return xapiBreadcrumbs.map((xapiBreadcrumb) => ({
      title: xapiBreadcrumb.title,
      route: `/${xapiBreadcrumb.seoPath}`,
    }));
  }
  return undefined;
}
