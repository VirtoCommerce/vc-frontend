import { IBreadcrumbsItem } from "./../types/index";
import { Breadcrumb } from "@core/api/graphql/types";
import SeoUrl from "@core/seo-routes.enum";

// TODO: move this logic to core level into the separated helper. Use it everywhere can be needful
export default () => {
  function buildBreadcrumbs(breadcrumbs: Breadcrumb[]) {
    const result: IBreadcrumbsItem[] = [{ url: "/", title: "Home" }];

    const productBreadcrumbs = breadcrumbs.map((x) => {
      return {
        title: x?.title,
        url: x?.typeName === "CatalogProduct" ? `/${SeoUrl.Product}/${x.itemId}` : `/${SeoUrl.Catalog}/${x?.seoPath}`,
      } as IBreadcrumbsItem;
    });

    if (productBreadcrumbs?.length) {
      result.push(...productBreadcrumbs);
    }

    return result;
  }

  return {
    buildBreadcrumbs,
  };
};
