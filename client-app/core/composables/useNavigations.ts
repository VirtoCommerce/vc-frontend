import { createGlobalState } from "@vueuse/core";
import clone from "lodash/clone";
import mergeWith from "lodash/mergeWith";
import { computed, readonly, ref, shallowRef, triggerRef } from "vue";
import menuData from "@/config/menu.json";
import { getChildCategories, getMenu } from "@/core/api/graphql";
import { useCurrency } from "@/core/composables/useCurrency";
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
  isActiveRoute,
} from "@/core/utilities";
import { globals } from "../globals";
import type { ExtendedMenuLinkType, MenuType, MarkedMenuLinkType } from "../types";
import type { DeepPartial } from "utility-types";
import type { RouteLocationNormalizedLoaded } from "vue-router";

export function _useNavigations() {
  const { currentCurrency } = useCurrency();

  const matchingRouteName = ref("");
  const menuSchema = shallowRef<MenuType | null>(menuData);
  const catalogMenuItems = shallowRef<ExtendedMenuLinkType[]>([]);
  const footerLinks = shallowRef<ExtendedMenuLinkType[]>([]);
  const pinnedLinks = shallowRef<ExtendedMenuLinkType[]>([]);

  function markLinkTree(
    link?: ExtendedMenuLinkType,
    currentRoute?: RouteLocationNormalizedLoaded,
    type?: "pinned" | "category",
  ): MarkedMenuLinkType | undefined {
    if (!link) {
      return;
    }

    function markRecursively(_link?: ExtendedMenuLinkType): MarkedMenuLinkType {
      const children = _link?.children?.map(markRecursively) ?? [];

      const isSelfActive = isActiveRoute(_link?.route ?? "", currentRoute as RouteLocationNormalizedLoaded);
      const isChildActive = children.some((c) => c.isActive);

      return {
        ..._link,
        children,
        isActive: isSelfActive || isChildActive,
        type,
      };
    }

    return markRecursively(link);
  }

  const desktopMainMenuItems = computed<ExtendedMenuLinkType[]>(() =>
    (menuSchema.value?.header?.desktop?.main || [])
      .map((item: ExtendedMenuLinkType) => getTranslatedMenuLink(item))
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)),
  );

  const desktopAccountMenuItems = computed<ExtendedMenuLinkType | undefined>(() => {
    const schema = menuSchema.value?.header?.desktop?.account
      ? clone(getTranslatedMenuLink(menuSchema.value.header.desktop.account))
      : undefined;
    if (Array.isArray(schema?.children)) {
      schema.children.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    }
    return schema;
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

  const { themeContext } = useThemeContext();
  const { getSettingValue } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);

  async function fetchFooterLinks() {
    try {
      footerLinks.value = (await getMenu("footer-links")).map((item) => convertToExtendedMenuLink(item, false));
    } catch (e) {
      Logger.error(`${useNavigations.name}.${fetchFooterLinks.name}`, e);
    }
  }

  async function fetchPinnedLinks() {
    try {
      pinnedLinks.value = (await getMenu("pinned-links")).map((item) => convertToExtendedMenuLink(item, false));
    } catch (e) {
      Logger.error(`${useNavigations.name}.${fetchPinnedLinks.name}`, e);
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

        const catalogId = themeContext.value.catalogId;
        const currencyCode = currentCurrency.value.code;

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

  function setMatchingRouteName(value: string) {
    matchingRouteName.value = value;
  }

  function mergeMenuSchema(additionalSchema: DeepPartial<MenuType>) {
    menuSchema.value = mergeWith(menuSchema.value, additionalSchema, (objValue: unknown, srcValue: unknown) => {
      if (Array.isArray(objValue) && Array.isArray(srcValue)) {
        return objValue.concat(srcValue) as ExtendedMenuLinkType[];
      }
    });
    triggerRef(menuSchema);
  }

  return {
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

    fetchCatalogMenu,
    catalogMenuItems: computed(() => catalogMenuItems.value),

    fetchFooterLinks,
    footerLinks: computed(() => footerLinks.value),

    fetchPinnedLinks,
    pinnedLinks: computed(() => pinnedLinks.value),
    markLinkTree,

    mergeMenuSchema,
  };
}

export const useNavigations = createGlobalState(_useNavigations);
