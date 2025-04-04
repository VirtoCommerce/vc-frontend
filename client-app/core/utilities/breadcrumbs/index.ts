export function buildBreadcrumbs<T extends { title: string; seoPath?: string }[]>(items?: T): IBreadcrumb[] {
  return (
    items?.map(({ title, seoPath }) => {
      let route: string | undefined;

      if (seoPath) {
        route = seoPath.startsWith("/") ? seoPath : "/" + seoPath;
      }

      return { title, route };
    }) || []
  );
}
