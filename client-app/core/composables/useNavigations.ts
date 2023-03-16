import { computed, readonly, ref, shallowRef, triggerRef } from "vue";
import globals from "../globals";
import { categoryTreeItemToMenuLink, getTranslatedMenuLink } from "../utilities/menu";
import { useCategories } from "./useCategories";
import type { MenuLinkType } from "../types";

const menuSchema = shallowRef<typeof import("../../../config/menu.json")>();
const openedMenuLinksStack = shallowRef<MenuLinkType[]>([]);
const matchedRouteName = ref("");

const { categoryTree } = useCategories();

const desktopHeaderMenuLinks = computed<MenuLinkType[]>(() =>
  (menuSchema.value?.header.desktop || []).map((item: MenuLinkType) => getTranslatedMenuLink(item, globals.i18n))
);

const mobileMainMenuLinks = computed<MenuLinkType[]>(() =>
  (menuSchema.value?.header.mobile.main || []).map((item: MenuLinkType) => {
    const menuLink: MenuLinkType = getTranslatedMenuLink(item, globals.i18n);

    if (menuLink.id === "catalog") {
      menuLink.children = categoryTree.value?.children.map(categoryTreeItemToMenuLink);
    }

    return menuLink;
  })
);

const mobileCatalogMenuLink = computed<MenuLinkType | null>(
  () => mobileMainMenuLinks.value.find((item) => item.id === "catalog") || null
);

const mobileAccountMenuLink = computed<MenuLinkType | null>(() =>
  menuSchema.value ? getTranslatedMenuLink(menuSchema.value.header.mobile.account, globals.i18n) : null
);

const mobileCorporateMenuLink = computed<MenuLinkType | null>(() =>
  menuSchema.value ? getTranslatedMenuLink(menuSchema.value.header.mobile.corporate, globals.i18n) : null
);

const mobilePreSelectedMenuLink = computed<MenuLinkType | null>(() => {
  const matchedRouteNames = globals.router.currentRoute.value.matched
    .map((item) => item.name)
    .concat(matchedRouteName.value)
    .filter(Boolean);

  let preSelectedLink: MenuLinkType | null = null;

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

function selectMenuItem(item: MenuLinkType) {
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
    openedItem: computed<MenuLinkType | undefined>(
      () => openedMenuLinksStack.value[openedMenuLinksStack.value.length - 1]
    ),
  };
}
