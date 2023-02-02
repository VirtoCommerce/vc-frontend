import { I18n } from "@/i18n";
import { getCategoryRoute, MenuLink } from "@/core";
import { Category } from "@/xapi";

export function categoryToMenuLink(category: Category, priority?: number): MenuLink {
  return {
    id: "catalog",
    categoryId: category.id,
    priority,
    title: category.name,
    route: getCategoryRoute(category),
    children: category.childCategories?.map(categoryToMenuLink),
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
