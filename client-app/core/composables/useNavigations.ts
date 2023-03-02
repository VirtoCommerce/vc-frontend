import { computed, readonly, ref, shallowRef, triggerRef } from "vue";
import globals from "../globals";
import type { MenuLink } from "../types";
import { categoryTreeItemToMenuLink, getTranslatedMenuLink } from "../utilities/menu";
import { useCategories } from "./useCategories";

const menuSchema = shallowRef<typeof import("../../../config/menu.json")>();
const openedMenuLinksStack = shallowRef<MenuLink[]>([]);
const matchedRouteName = ref("");

const { categoryTree } = useCategories();

const desktopHeaderMenuLinks = computed<MenuLink[]>(() =>
  (menuSchema.value?.header.desktop || []).map((item: MenuLink) => getTranslatedMenuLink(item, globals.i18n))
);

const mobileMainMenuLinks = computed<MenuLink[]>(() =>
  (menuSchema.value?.header.mobile.main || []).map((item: MenuLink) => {
    const menuLink: MenuLink = getTranslatedMenuLink(item, globals.i18n);

    if (menuLink.id === "catalog") {
      menuLink.children = categoryTree.value?.children.map(categoryTreeItemToMenuLink);
    }

    return menuLink;
  })
);

const mobileCatalogMenuLink = computed<MenuLink | null>(
  () => mobileMainMenuLinks.value.find((item) => item.id === "catalog") || null
);

const mobileAccountMenuLink = computed<MenuLink | null>(() =>
  menuSchema.value ? getTranslatedMenuLink(menuSchema.value.header.mobile.account, globals.i18n) : null
);

const mobileCorporateMenuLink = computed<MenuLink | null>(() =>
  menuSchema.value ? getTranslatedMenuLink(menuSchema.value.header.mobile.corporate, globals.i18n) : null
);

const mobilePreSelectedMenuLink = computed<MenuLink | null>(() => {
  const matchedRouteNames = globals.router.currentRoute.value.matched
    .map((item) => item.name)
    .concat(matchedRouteName.value)
    .filter(Boolean);

  let preSelectedLink: MenuLink | null = null;

  if (["Catalog", "Category", "Product"].some((item) => matchedRouteNames.includes(item))) {
    preSelectedLink = mobileCatalogMenuLink.value;
  } else if (matchedRouteNames.includes("Account") && !matchedRouteNames.includes("Dashboard")) {
    preSelectedLink = mobileAccountMenuLink.value;
  } else if (matchedRouteNames.includes("Company")) {
    preSelectedLink = mobileCorporateMenuLink.value;
  }

  return preSelectedLink;
});

async function fetchMenus() {
  /**
   * FIXME: Don't use import
   * Fetch file (json) from Storefront to be able to edit file in Admin panel
   */
  menuSchema.value = await import("../../../config/menu.json");
}

function goBack() {
  openedMenuLinksStack.value.pop();
  triggerRef(openedMenuLinksStack);
}

function goMainMenu() {
  openedMenuLinksStack.value = [];
  triggerRef(openedMenuLinksStack);
}

function selectMenuItem(item: MenuLink) {
  if (!item.children) {
    return;
  }
  openedMenuLinksStack.value.push(item);
  triggerRef(openedMenuLinksStack);
}

function setMatchedRouteName(value: string) {
  matchedRouteName.value = value;
}

export function useNavigations() {
  return {
    fetchMenus,
    goBack,
    goMainMenu,
    selectMenuItem,
    setMatchedRouteName,
    desktopHeaderMenuLinks,
    mobileMainMenuLinks,
    mobileCatalogMenuLink,
    mobileAccountMenuLink,
    mobileCorporateMenuLink,
    mobilePreSelectedMenuLink,
    matchedRouteName: readonly(matchedRouteName),
    openedItem: computed<MenuLink | undefined>(() => openedMenuLinksStack.value[openedMenuLinksStack.value.length - 1]),
  };
}
