import type { I18n } from "@/i18n";
import type { CategoryTreeItemType, MenuLinkType } from "../../types";
import { getCategoryRoute } from "../categories";

export function categoryTreeItemToMenuLink(categoryTreeItem: CategoryTreeItemType, priority?: number): MenuLinkType {
  return {
    priority,
    title: categoryTreeItem.name,
    route: getCategoryRoute(categoryTreeItem),
    children: categoryTreeItem.children.map(categoryTreeItemToMenuLink),
  };
}

export function getTranslatedMenuLink(menuLink: MenuLinkType, i18n: I18n): MenuLinkType {
  if (menuLink.title) {
    menuLink.title = i18n.global.t(menuLink.title);
  }

  if (menuLink.children?.length) {
    menuLink.children = menuLink.children.map((item) => getTranslatedMenuLink(item, i18n));
  }

  return menuLink;
}
