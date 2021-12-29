import { IBreadcrumbsItem } from "./../types/index";
import { Breadcrumb } from "@core/api/graphql/types";

export default () => {
  function buildBreadcrumbs(breadcrumbs: Breadcrumb[]) {
    const result: IBreadcrumbsItem[] = [{ url: "/", title: "Home" }];

    const productBreadcrumbs = breadcrumbs.map((x) => {
      return {
        title: x?.title,
        url: x?.typeName === "CatalogProduct" ? "/product/" + x.itemId : "/catalog/" + x?.seoPath,
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
