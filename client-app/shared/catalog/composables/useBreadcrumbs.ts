import { useI18n } from "vue-i18n";
import { Breadcrumb } from "@/xapi";
import { IBreadcrumbsItem } from "@/shared/catalog";

// TODO: move this logic to core level into the separated helper. Use it everywhere can be needful
export default () => {
  const { t } = useI18n();

  function buildBreadcrumbs(items: Breadcrumb[]): IBreadcrumbsItem[] {
    const homepage: IBreadcrumbsItem = {
      title: t("common.links.home"),
      url: "/",
    };
    const breadcrumbs = items.map(({ title, seoPath }) => ({
      title,
      url: seoPath?.startsWith("/") ? seoPath : "/" + seoPath,
    }));

    return [homepage].concat(breadcrumbs);
  }

  return {
    buildBreadcrumbs,
  };
};
