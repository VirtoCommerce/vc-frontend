import { globals } from "../../globals";
import { getCategoryRoute } from "../categories";
import { isSafeLinkUrl } from "../common";
import type { ExtendedMenuLinkType } from "../../types";
import type { Category, MenuLinkType } from "@/core/api/graphql/types";

/** Menus are edited content: a link that would run script opens nothing. */
export function convertToExtendedMenuLink(item: MenuLinkType, isCatalogItem?: boolean): ExtendedMenuLinkType {
  return {
    isCatalogItem,
    title: item.title,
    route: isSafeLinkUrl(item.url) ? item.url : undefined,
    children: item.childItems?.map((child) => convertToExtendedMenuLink(child, isCatalogItem)),
    priority: item.priority,
  };
}

export function categoryToExtendedMenuLink(category: Category, isCatalogItem?: boolean): ExtendedMenuLinkType {
  return {
    isCatalogItem,
    id: category.id,
    title: category.name,
    route: getCategoryRoute(category),
    children: category.childCategories?.map((child) => categoryToExtendedMenuLink(child, isCatalogItem)),
    priority: category.priority,
  };
}

export function getTranslatedMenuLink(menuLink: ExtendedMenuLinkType, i18n = globals.i18n): ExtendedMenuLinkType {
  if (menuLink.title) {
    menuLink.title = i18n?.global.t(menuLink.title);
  }

  if (menuLink.children?.length) {
    menuLink.children = menuLink.children.map((child) => getTranslatedMenuLink(child, i18n));
  }

  return menuLink;
}
