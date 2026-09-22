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
 * Translates a menu link tree into a fresh copy, leaving the input untouched.
 *
 * Translating in place would write the label back over the i18n key, which costs twice: the key is
 * gone, so a later locale switch can't re-translate it; and the link objects keep their identity, so
 * a component holding one as a prop never re-renders. Module locale bundles are merged
 * asynchronously at boot, well after the menu first renders, and the sidebar was left showing raw
 * keys for good (VCST-5681).
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
