import { useI18n } from "vue-i18n";
import { IBreadcrumbsItem } from "./../types/index";
import { Breadcrumb } from "@/xapi/graphql/types";

// TODO: move this logic to core level into the separated helper. Use it everywhere can be needful
export default () => {
  const { t } = useI18n();

  function buildBreadcrumbs(breadcrumbs: Breadcrumb[]) {
    const result: IBreadcrumbsItem[] = [{ url: "/", title: t("common.links.home") }];

    breadcrumbs.forEach((breadcrumb) =>
      result.push({
        title: breadcrumb.title,
        url: `/${breadcrumb.seoPath}`,
      })
    );

    return result;
  }

  return {
    buildBreadcrumbs,
  };
};
