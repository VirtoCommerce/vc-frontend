import type { RouteLocationRaw } from "vue-router";

export type MenuType = {
  header: {
    desktop: ExtendedMenuLinkType[];
    mobile: {
      main: ExtendedMenuLinkType[];
      account: { id: string; route: { name: string }; title: string; icon: string; children: ExtendedMenuLinkType[] };
      corporate: { id: string; route: { name: string }; title: string; icon: string; children: ExtendedMenuLinkType[] };
    };
  };
  footer: ExtendedMenuLinkType[];
};

export type ExtendedMenuLinkType = {
  id?: string;
  title?: string;
  icon?: string;
  route?: RouteLocationRaw;
  children?: ExtendedMenuLinkType[];
  priority?: number;
  isCatalogItem?: boolean;
  isContactOrganizationsItem?: boolean;
};
