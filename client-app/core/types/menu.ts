import type { RouteLocationRaw } from "vue-router";

export type MenuType = {
  header: {
    desktop: {
      main: ExtendedMenuLinkType[];
      account: ExtendedMenuLinkType;
      corporate: ExtendedMenuLinkType;
    };
    mobile: {
      main: ExtendedMenuLinkType[];
      account: ExtendedMenuLinkType;
      corporate: ExtendedMenuLinkType;
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
};
