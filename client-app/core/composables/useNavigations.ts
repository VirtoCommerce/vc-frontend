import { computed, readonly, ref, shallowRef, triggerRef } from "vue";
import { getChildCategories, getMenu } from "@/core/api/graphql";
import { useThemeContext } from "@/core/composables/useThemeContext";
import {
  convertToExtendedMenuLink,
  getFilterExpressionForCategorySubtree,
  getFilterExpressionForInStock,
  getFilterExpressionForZeroPrice,
  Logger,
} from "@/core/utilities";
import { useUser } from "@/shared/account/composables/useUser";
import { globals } from "../globals";
import { categoryToExtendedMenuLink, getTranslatedMenuLink } from "../utilities/menu";
import type { ExtendedMenuLinkType } from "../types";

const loading = ref(false);
const matchingRouteName = ref("");
const menuSchema = shallowRef<typeof import("../../../config/menu.json")>();
const catalogMenuItems = shallowRef<ExtendedMenuLinkType[]>([]);
const openedMenuItemsStack = shallowRef<ExtendedMenuLinkType[]>([]);
const footerLinks = shallowRef<ExtendedMenuLinkType[]>([]);
const mobileContactOrganizationsMenu = shallowRef<ExtendedMenuLinkType | undefined>();

const openedItem = computed<ExtendedMenuLinkType | undefined>(
  () => openedMenuItemsStack.value[openedMenuItemsStack.value.length - 1],
);

const desktopMainMenuItems = computed<ExtendedMenuLinkType[]>(() =>
  (menuSchema.value?.header.desktop || []).map((item: ExtendedMenuLinkType) => getTranslatedMenuLink(item)),
);

const mobileMainMenuItems = computed<ExtendedMenuLinkType[]>(() =>
  (menuSchema.value?.header.mobile.main || []).map((item: ExtendedMenuLinkType) => {
    const menuLink: ExtendedMenuLinkType = getTranslatedMenuLink(item);

    if (menuLink.id === "catalog") {
      menuLink.children = catalogMenuItems.value;
    }

    return menuLink;
  }),
);

const mobileCatalogMenuItem = computed<ExtendedMenuLinkType | null>(
  () => mobileMainMenuItems.value.find((item) => item.id === "catalog") || null,
);

const mobileAccountMenuItem = computed<ExtendedMenuLinkType | null>(() =>
  menuSchema.value ? getTranslatedMenuLink(menuSchema.value.header.mobile.account) : null,
);

const mobileCorporateMenuItem = computed<ExtendedMenuLinkType | null>(() =>
  menuSchema.value ? getTranslatedMenuLink(menuSchema.value.header.mobile.corporate) : null,
);

const mobilePreSelectedMenuItem = computed<ExtendedMenuLinkType | null>(() => {
  const matchedRouteNames = globals.router.currentRoute.value.matched
    .map((item) => item.name)
    .concat(matchingRouteName.value)
    .filter(Boolean);

  let preSelectedLink: ExtendedMenuLinkType | null = null;

  if (["Catalog", "Category", "Product"].some((item) => matchedRouteNames.includes(item))) {
    preSelectedLink = mobileCatalogMenuItem.value;
  } else if (matchedRouteNames.includes("Account") && !matchedRouteNames.includes("Dashboard")) {
    preSelectedLink = mobileAccountMenuItem.value;
  } else if (matchedRouteNames.includes("Company")) {
    preSelectedLink = mobileCorporateMenuItem.value;
  }

  return preSelectedLink;
});

export function useNavigations() {
  const { themeContext } = useThemeContext();

  async function fetchMenuSchema() {
    try {
      /**
       * FIXME: Don't use import
       * Fetch file (json) from Storefront to be able to edit file in Admin panel
       */
      menuSchema.value = await import("../../../config/menu.json");
    } catch (e) {
      Logger.error(`${useNavigations.name}.${fetchMenuSchema.name}`, e);
    }
  }

  async function fetchFooterLinks() {
    try {
      footerLinks.value = (await getMenu("footer-links")).map((item) => convertToExtendedMenuLink(item, false));
    } catch (e) {
      Logger.error(`${useNavigations.name}.${fetchFooterLinks.name}`, e);
    }
  }

  function getMobileContactOrganizationsMenu() {
    const { isMultiOrganization, user } = useUser();

    const organizationsMenuItems = user.value?.contact?.organizations?.items?.map<ExtendedMenuLinkType>((item) => ({
      id: item.id,
      title: item.name,
      isContactOrganizationsItem: true,
    }));

    if (isMultiOrganization.value) {
      mobileContactOrganizationsMenu.value = {
        id: "contact-organizations",
        title: "common.labels.my_organizations",
        icon: "/static/images/dashboard/icons/company.svg#main",
        children: organizationsMenuItems,
      };

      mobileAccountMenuItem.value?.children?.splice(1, 0, mobileContactOrganizationsMenu.value);
    }
  }

  async function fetchCatalogMenu() {
    const { catalog_menu_link_list_name, catalog_empty_categories_enabled, zero_price_product_enabled } =
      themeContext.value.settings;

    try {
      if (catalog_menu_link_list_name) {
        // Use a list of links
        catalogMenuItems.value = (await getMenu(catalog_menu_link_list_name)).map((item) =>
          convertToExtendedMenuLink(item, true),
        );
      } else {
        // Use the query `childCategories`, with `maxLevel` equal to 2
        const { catalogId, currencyCode } = globals;

        const productFilter = catalog_empty_categories_enabled
          ? undefined
          : [
              getFilterExpressionForCategorySubtree({ catalogId }),
              getFilterExpressionForZeroPrice(!!zero_price_product_enabled, currencyCode),
              getFilterExpressionForInStock(true),
            ]
              .filter(Boolean)
              .join(" ");

        catalogMenuItems.value = (
          await getChildCategories({
            maxLevel: 2,
            onlyActive: true,
            productFilter,
          })
        ).map((item) => categoryToExtendedMenuLink(item, true));
      }
    } catch (e) {
      Logger.error(`${useNavigations.name}.${fetchCatalogMenu.name}`, e);
    }
  }

  async function fetchMenus() {
    loading.value = true;
    await Promise.all([fetchMenuSchema(), fetchCatalogMenu(), fetchFooterLinks()]);
    getMobileContactOrganizationsMenu();
    loading.value = false;
  }

  function goBack() {
    openedMenuItemsStack.value.pop();
    triggerRef(openedMenuItemsStack);
  }

  function goMainMenu() {
    openedMenuItemsStack.value = [];
    triggerRef(openedMenuItemsStack);
  }

  function selectMenuItem(item: ExtendedMenuLinkType) {
    if (!item.children) {
      return;
    }
    openedMenuItemsStack.value.push(item);
    triggerRef(openedMenuItemsStack);
  }

  function setMatchingRouteName(value: string) {
    matchingRouteName.value = value;
  }

  return {
    fetchMenus,
    fetchFooterLinks,
    goBack,
    goMainMenu,
    selectMenuItem,
    setMatchingRouteName,
    openedItem,
    desktopMainMenuItems,
    mobileMainMenuItems,
    mobileCatalogMenuItem,
    mobileAccountMenuItem,
    mobileCorporateMenuItem,
    mobileContactOrganizationsMenu,
    mobilePreSelectedMenuItem,
    matchingRouteName: readonly(matchingRouteName),
    catalogMenuItems: computed(() => catalogMenuItems.value),
    footerLinks: computed(() => footerLinks.value),
  };
}
