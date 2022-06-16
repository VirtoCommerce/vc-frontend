import { computed, shallowRef, triggerRef } from "vue";
import { MenuLink } from "@/shared/layout";
import { getMenus } from "@/xapi/graphql/common";
import { MenuLinkType } from "@/xapi/graphql/types";
import globals from "@core/globals";

const menuLinkLists = shallowRef<Record<string, MenuLinkType[]>>();
const menuSchema = shallowRef<Record<string, any>>();

const openedMenuLinksStack = shallowRef<MenuLink[]>([]);

function getChildrenItem(childrenItem: MenuLinkType) {
  return {
    id: childrenItem.url?.split("/").pop(),
    title: childrenItem.title,
    route: childrenItem.url,
  };
}

const mainMenuLinks = computed<MenuLink[]>(() =>
  (menuSchema.value?.header.main || []).map(
    (item: Record<string, string>) =>
      ({
        id: item.id,
        route: item.route,
        title: globals.i18n!.global.t(item.title),
        icon: item.icon,
        children: (menuLinkLists.value?.[item.id] || []).map((childrenItem) => getChildrenItem(childrenItem)),
      } as MenuLink)
  )
);

const desktopCatalog = computed<MenuLink>(
  () =>
    ({
      id: "all-products-menu",
      route: {
        name: "Catalog",
      },
      title: globals.i18n!.global.t("shared.layout.header.catalog"),
      children: (menuLinkLists.value?.["all-products-menu"] || []).map((childrenItem) => getChildrenItem(childrenItem)),
    } as MenuLink)
);

async function fetchMenus(cultureName: string) {
  const results = await getMenus({ cultureName });

  menuLinkLists.value = results.reduce<Record<string, MenuLinkType[]>>((result, menuLinkList) => {
    result[menuLinkList.name!] = menuLinkList.items!;
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

export default function useNavigations() {
  return {
    fetchMenus,
    goBack,
    goMainMenu,
    selectMenuItem,
    mainMenuLinks,
    desktopCatalog,
    openedItem: computed<MenuLink | undefined>(() => openedMenuLinksStack.value[openedMenuLinksStack.value.length - 1]),
  };
}
