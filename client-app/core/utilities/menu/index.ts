import { globals } from "../../globals";
import { getCategoryRoute } from "../categories";
import type { ExtendedMenuLinkType } from "../../types";
import type { Category, MenuLinkType } from "@/core/api/graphql/types";

export function convertToExtendedMenuLink(item: MenuLinkType, isCatalogItem?: boolean): ExtendedMenuLinkType {
  return {
    isCatalogItem,
    title: item.title,
    route: item.url,
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

/**
 * Returns a copy; the input keeps its i18n keys. Translating in place would both destroy the key a
 * later locale switch needs and keep object identity, so a component holding a link as a prop never
 * re-renders when a module's locale bundle merges after the first render (VCST-5681).
 */
export function getTranslatedMenuLink(menuLink: ExtendedMenuLinkType, i18n = globals.i18n): ExtendedMenuLinkType {
  const translated: ExtendedMenuLinkType = { ...menuLink };

  if (menuLink.title) {
    translated.title = i18n?.global.t(menuLink.title);
  }

  if (menuLink.children?.length) {
    translated.children = menuLink.children.map((child) => getTranslatedMenuLink(child, i18n));
  }

  return translated;
}
