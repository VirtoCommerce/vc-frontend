import type { RouteLocationRaw } from "vue-router";

export type MenuType = {
  header: {
    desktop: {
      main: ExtendedMenuLinkType[];
      purchasing: ExtendedMenuLinkType;
      marketing: ExtendedMenuLinkType;
      user: ExtendedMenuLinkType;
      corporate: ExtendedMenuLinkType;
    };
    mobile: {
      main: ExtendedMenuLinkType[];
      purchasing: ExtendedMenuLinkType;
      marketing: ExtendedMenuLinkType;
      user: ExtendedMenuLinkType;
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
  dataTestId?: string;
};

export type MarkedMenuLinkType = ExtendedMenuLinkType & {
  isActive?: boolean;
  type?: "pinned" | "category";
  children?: MarkedMenuLinkType[];
};
