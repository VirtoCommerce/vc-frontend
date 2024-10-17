import _ from "lodash";
import { computed, readonly, ref, shallowRef, triggerRef } from "vue";
import menuData from "@/config/menu.json";
import { getChildCategories, getMenu } from "@/core/api/graphql";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import {
  convertToExtendedMenuLink,
  getFilterExpressionForCategorySubtree,
  getFilterExpressionForInStock,
  getFilterExpressionForZeroPrice,
  Logger,
  categoryToExtendedMenuLink,
  getTranslatedMenuLink,
} from "@/core/utilities";
import { globals } from "../globals";
import type { ExtendedMenuLinkType, MenuType } from "../types";
import type { DeepPartial } from "utility-types";

const loading = ref(false);
const matchingRouteName = ref("");
const menuSchema = shallowRef<MenuType | null>(null);
const catalogMenuItems = shallowRef<ExtendedMenuLinkType[]>([]);
const footerLinks = shallowRef<ExtendedMenuLinkType[]>([]);

const desktopMainMenuItems = computed<ExtendedMenuLinkType[]>(() =>
  (menuSchema.value?.header?.desktop?.main || [])
    .map((item: ExtendedMenuLinkType) => getTranslatedMenuLink(item))
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)),
);

const desktopAccountMenuItems = computed<ExtendedMenuLinkType | undefined>(() => {
  return menuSchema.value ? getTranslatedMenuLink(menuSchema.value?.header?.desktop?.account) : undefined;
});

const desktopCorporateMenuItems = computed<ExtendedMenuLinkType | undefined>(() => {
  return menuSchema.value ? getTranslatedMenuLink(menuSchema.value?.header?.desktop?.corporate) : undefined;
});

const mobileMainMenuItems = computed<ExtendedMenuLinkType[]>(() =>
  (menuSchema.value?.header?.mobile?.main || []).map((item: ExtendedMenuLinkType) => {
    const menuLink: ExtendedMenuLinkType = getTranslatedMenuLink(item);

    if (menuLink.id === "catalog") {
      menuLink.children = catalogMenuItems.value;
    }

    return menuLink;
  }),
);

const mobileCatalogMenuItem = computed<ExtendedMenuLinkType | undefined>(
  () => mobileMainMenuItems.value.find((item) => item.id === "catalog") || undefined,
);

const mobileAccountMenuItem = computed<ExtendedMenuLinkType | undefined>(() => {
  if (!menuSchema.value) {
    return undefined;
  }

  return getTranslatedMenuLink(menuSchema.value?.header?.mobile?.account);
});

const mobileCorporateMenuItem = computed<ExtendedMenuLinkType | undefined>(() =>
  menuSchema.value ? getTranslatedMenuLink(menuSchema.value.header.mobile.corporate) : undefined,
);

const mobilePreSelectedMenuItem = computed<ExtendedMenuLinkType | undefined>(() => {
  const matchedRouteNames = globals.router.currentRoute.value.matched
    .map((item) => item.name)
    .concat(matchingRouteName.value)
    .filter(Boolean);

  let preSelectedLink: ExtendedMenuLinkType | undefined;

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
  const { getSettingValue } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);

  async function fetchFooterLinks() {
    try {
      footerLinks.value = (await getMenu("footer-links")).map((item) => convertToExtendedMenuLink(item, false));
    } catch (e) {
      Logger.error(`${useNavigations.name}.${fetchFooterLinks.name}`, e);
    }
  }

  async function fetchCatalogMenu() {
    const { zero_price_product_enabled } = themeContext.value.settings;

    const catalog_menu_link_list_name = getSettingValue(MODULE_XAPI_KEYS.CATALOG_MENU_LINK_LIST_NAME);
    const catalog_empty_categories_enabled = getSettingValue(MODULE_XAPI_KEYS.CATALOG_EMPTY_CATEGORIES_ENABLED);

    try {
      if (catalog_menu_link_list_name && typeof catalog_menu_link_list_name === "string") {
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
    menuSchema.value = menuData as MenuType;
    await Promise.all([fetchCatalogMenu(), fetchFooterLinks()]);
    loading.value = false;
  }

  function setMatchingRouteName(value: string) {
    matchingRouteName.value = value;
  }

  function mergeMenuSchema(additionalSchema: DeepPartial<MenuType>) {
    menuSchema.value = _.mergeWith(menuSchema.value, additionalSchema, (objValue: unknown, srcValue: unknown) => {
      if (_.isArray(objValue) && _.isArray(srcValue)) {
        return objValue.concat(srcValue) as ExtendedMenuLinkType[];
      }
    });
    triggerRef(menuSchema);
  }

  return {
    fetchMenus,
    setMatchingRouteName,
    desktopMainMenuItems,
    desktopAccountMenuItems,
    desktopCorporateMenuItems,
    mobileMainMenuItems,
    mobileCatalogMenuItem,
    mobileAccountMenuItem,
    mobileCorporateMenuItem,
    mobilePreSelectedMenuItem,
    matchingRouteName: readonly(matchingRouteName),
    catalogMenuItems: computed(() => catalogMenuItems.value),
    footerLinks: computed(() => footerLinks.value),

    mergeMenuSchema,
  };
}
