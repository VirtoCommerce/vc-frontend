import { computed, readonly, ref, shallowRef, triggerRef } from "vue";
import { linkListsItemToMenuLink, MenuLink } from "@/shared/layout";
import { getMenus } from "@/xapi/graphql/common";
import globals from "@/core/globals";

const menuLinkLists = shallowRef<Record<string, MenuLink[]>>();
const menuSchema = shallowRef<Record<string, any>>();
const openedMenuLinksStack = shallowRef<MenuLink[]>([]);
const matchedRouteName = ref("");

const desktopHeaderMenuLinks = computed<MenuLink[]>(() =>
  (menuSchema.value?.header.desktop || []).map(
    (link: MenuLink): MenuLink => ({
      ...link,
      title: globals.i18n!.global.t(link.title!),
    })
  )
);

const mobileHeaderMenuLinks = computed<MenuLink[]>(() =>
  (menuSchema.value?.header.mobile.main || []).map(
    (link: MenuLink): MenuLink => ({
      ...link,
      title: globals.i18n!.global.t(link.title!),
      children: menuLinkLists.value?.[link.id!],
    })
  )
);

const mobileCatalogMenuLink = computed<MenuLink | undefined>(() =>
  mobileHeaderMenuLinks.value.find((item) => item.id === "all-products-menu")
);

const mobileAccountMenuLink = computed<MenuLink | undefined>(() => {
  const rawMenuLink: MenuLink | undefined = menuSchema.value?.header.mobile.account;
  return rawMenuLink
    ? {
        ...rawMenuLink,
        title: globals.i18n!.global.t(rawMenuLink.title!),
        children: rawMenuLink.children?.map((item) => ({
          ...item,
          title: item.title ? globals.i18n!.global.t(item.title) : "",
        })),
      }
    : undefined;
});

const mobilePreSelectedMenuLink = computed<MenuLink | undefined>(() => {
  const matchedRouteNames = globals.router.currentRoute.value.matched
    .map((item) => item.name)
    .concat(matchedRouteName.value)
    .filter(Boolean);

  let preSelectedLink: MenuLink | undefined;

  if (["Catalog", "Category", "Product"].some((item) => matchedRouteNames.includes(item))) {
    preSelectedLink = mobileCatalogMenuLink.value;
  } else if (matchedRouteNames.includes("Account") && !matchedRouteNames.includes("Dashboard")) {
    preSelectedLink = mobileAccountMenuLink.value;
  }

  return preSelectedLink;
});

async function fetchMenus(cultureName: string) {
  const results = await getMenus({ cultureName });

  menuLinkLists.value = results.reduce<Record<string, MenuLink[]>>((result, menuLinkList) => {
    result[menuLinkList.name!] = menuLinkList.items!.map((item) => linkListsItemToMenuLink(item));
    return result;
  }, {});

  /**
   * FIXME: Don't use import
   * Fetch file (json) from Storefront to be able to edit file in Admin panel
   */
  menuSchema.value = await import("../../../../config/menu.json");
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

export default function useNavigations() {
  return {
    fetchMenus,
    goBack,
    goMainMenu,
    selectMenuItem,
    setMatchedRouteName,
    desktopHeaderMenuLinks,
    mobileHeaderMenuLinks,
    mobileCatalogMenuLink,
    mobileAccountMenuLink,
    mobilePreSelectedMenuLink,
    matchedRouteName: readonly(matchedRouteName),
    openedItem: computed<MenuLink | undefined>(() => openedMenuLinksStack.value[openedMenuLinksStack.value.length - 1]),
  };
}
