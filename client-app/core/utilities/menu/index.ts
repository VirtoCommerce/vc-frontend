import type { I18n } from "@/i18n";
import type { CategoryTreeItemType, MenuLink } from "../../types";
import { getCategoryRoute } from "../../utilities/categories";

export function categoryTreeItemToMenuLink(categoryTreeItem: CategoryTreeItemType, priority?: number): MenuLink {
  return {
    priority,
    title: categoryTreeItem.name,
    route: getCategoryRoute(categoryTreeItem),
    children: categoryTreeItem.children.map(categoryTreeItemToMenuLink),
  };
}

export function getTranslatedMenuLink(menuLink: MenuLink, i18n: I18n): MenuLink {
  if (menuLink.title) {
    menuLink.title = i18n.global.t(menuLink.title);
  }

  if (menuLink.children?.length) {
    menuLink.children = menuLink.children.map((item) => getTranslatedMenuLink(item, i18n));
  }

  return menuLink;
}
