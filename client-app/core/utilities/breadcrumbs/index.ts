export function buildBreadcrumbs<T extends { title: string; seoPath?: string }[]>(items?: T): IBreadcrumb[] {
  return (
    items?.map(({ title, seoPath }) => ({
      title,
      route: seoPath?.startsWith("/") ? seoPath : "/" + seoPath,
    })) || []
  );
}
