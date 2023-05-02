import globals from "@/core/globals";
import { getCategoryRoute } from "../categories";
import type { CategoryTreeItemType, MenuLinkType as ExtendedMenuLinkType } from "../../types";
import type { I18n } from "@/i18n";
import type { Category, MenuLinkType } from "@/xapi/types";

/** @deprecated */
export function categoryTreeItemToMenuLink(
  categoryTreeItem: CategoryTreeItemType,
  priority?: number
): ExtendedMenuLinkType {
  return {
    priority,
    title: categoryTreeItem.name,
    route: getCategoryRoute(categoryTreeItem),
    children: categoryTreeItem.children.map(categoryTreeItemToMenuLink),
  };
}

export function categoryToMenuLink(category: Category, router = globals.router): MenuLinkType {
  const route = getCategoryRoute(category);

  return {
    title: category.name,
    url: typeof route === "string" ? route : router?.resolve(route).fullPath,
    childItems: category.childCategories?.map((item) => categoryToMenuLink(item, router)),
  };
}

export function getTranslatedMenuLink(menuLink: ExtendedMenuLinkType, i18n: I18n): ExtendedMenuLinkType {
  if (menuLink.title) {
    menuLink.title = i18n.global.t(menuLink.title);
  }

  if (menuLink.children?.length) {
    menuLink.children = menuLink.children.map((item) => getTranslatedMenuLink(item, i18n));
  }

  return menuLink;
}
