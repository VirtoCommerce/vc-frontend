import { createGlobalState } from "@vueuse/core";
import clone from "lodash/clone";
import mergeWith from "lodash/mergeWith";
import { computed, readonly, ref, shallowRef, triggerRef } from "vue";
import menuData from "@/config/menu.json";
import { getChildCategories, getMenu } from "@/core/api/graphql";
import { useCurrency } from "@/core/composables/useCurrency";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { useWhiteLabeling } from "@/core/composables/useWhiteLabeling";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import {
  convertToExtendedMenuLink,
  getFilterExpressionForCategorySubtree,
  getFilterExpressionForInStockVariations,
  getFilterExpressionForZeroPrice,
  Logger,
  categoryToExtendedMenuLink,
  getTranslatedMenuLink,
  isActiveRoute,
} from "@/core/utilities";
import { globals } from "../globals";
import type { MenuLinkType } from "../api/graphql/types";
import type {
  ExtendedMenuLinkType,
  MenuType,
  MarkedMenuLinkType,
  MenuSecionType,
  MobileMenuSectionType,
  DesktopMenuSectionType,
} from "../types";
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

    let index = 0;

    function markRecursively(_link?: ExtendedMenuLinkType): MarkedMenuLinkType {
      const children = _link?.children?.map(markRecursively) ?? [];

      const isSelfActive = isActiveRoute(_link?.route ?? "", currentRoute as RouteLocationNormalizedLoaded);
      const isChildActive = children.some((c) => c.isActive);

      return {
        ..._link,
        id: `${type}-${index++}`,
        children,
        isActive: isSelfActive || isChildActive,
        type,
      };
    }

    return markRecursively(link);
  }

  function createMenuComputed(type: "desktop" | "mobile", key: MenuSecionType) {
    return computed<ExtendedMenuLinkType | undefined>(() => {
      const raw = menuSchema.value?.header?.[type]?.[key];

      if (!raw) return undefined;

      const schema = clone(getTranslatedMenuLink(raw));

      if (Array.isArray(schema.children)) {
        schema.children.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
      }

      return schema;
    });
  }

  function createDesktopMenuComputed(key: DesktopMenuSectionType) {
    return createMenuComputed("desktop", key);
  }

  function createMobileMenuComputed(key: MobileMenuSectionType) {
    return createMenuComputed("mobile", key);
  }

  const desktopMainMenuItems = computed<ExtendedMenuLinkType[]>(() =>
    (menuSchema.value?.header?.desktop?.main || [])
      .map((item: ExtendedMenuLinkType) => getTranslatedMenuLink(item))
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)),
  );

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

  const mobilePurchasingMenuItem = createMobileMenuComputed("purchasing");
  const mobileMarketingMenuItem = createMobileMenuComputed("marketing");
  const mobileUserMenuItem = createMobileMenuComputed("user");
  const mobileCorporateMenuItem = createMobileMenuComputed("corporate");

  // Helper to extract route name from menu item
  function getRouteNameFromMenuItem(item: ExtendedMenuLinkType): string | null {
    const route = item.route;
    return typeof route === "object" && route && "name" in route ? (route.name as string) : null;
  }

  // Helper to check if section contains route in children
  function sectionHasRoute(
    section: ExtendedMenuLinkType | undefined,
    routeNames: readonly (string | symbol | undefined)[],
  ): boolean {
    if (!section?.children) {
      return false;
    }

    return section.children.some((child) => {
      const routeName = getRouteNameFromMenuItem(child);
      return !!routeName && routeNames.includes(routeName);
    });
  }

  const mobilePreSelectedMenuItem = computed<ExtendedMenuLinkType | undefined>(() => {
    const matchedRouteNames = globals.router.currentRoute.value.matched
      .map((item) => item.name)
      .concat(matchingRouteName.value)
      .filter(Boolean);

    // Don't auto-open any section on Dashboard
    if (matchedRouteNames.includes("Dashboard")) {
      return undefined;
    }

    // Special routes that don't belong to section children
    const specialRoutes: Record<string, ExtendedMenuLinkType | undefined> = {
      Catalog: mobileCatalogMenuItem.value,
      Category: mobileCatalogMenuItem.value,
      Product: mobileCatalogMenuItem.value,
    };

    // First check special routes
    const specialRoute = matchedRouteNames
      .map((route) => specialRoutes[route as string])
      .find((section) => section !== undefined);

    if (specialRoute) {
      return specialRoute;
    }

    // Then search in section children
    const sections = [
      mobilePurchasingMenuItem.value,
      mobileMarketingMenuItem.value,
      mobileUserMenuItem.value,
      mobileCorporateMenuItem.value,
    ];

    return sections.find((section) => sectionHasRoute(section, matchedRouteNames));
  });

  const { themeContext } = useThemeContext();
  const { getSettingValue } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);

  async function fetchFooterLinks() {
    try {
      footerLinks.value = (await getMenu("footer-links")).map((item) =>
        convertToExtendedMenuLink(item as MenuLinkType, false),
      );
    } catch (e) {
      Logger.error(`${useNavigations.name}.${fetchFooterLinks.name}`, e);
    }
  }

  async function fetchPinnedLinks() {
    try {
      pinnedLinks.value = (await getMenu("pinned-links")).map((item) =>
        convertToExtendedMenuLink(item as MenuLinkType, false),
      );
    } catch (e) {
      Logger.error(`${useNavigations.name}.${fetchPinnedLinks.name}`, e);
    }
  }

  async function fetchCatalogMenu() {
    const { zero_price_product_enabled } = themeContext.value.settings;

    const catalog_menu_link_list_name = getSettingValue(MODULE_XAPI_KEYS.CATALOG_MENU_LINK_LIST_NAME);
    const catalog_empty_categories_enabled = getSettingValue(MODULE_XAPI_KEYS.CATALOG_EMPTY_CATEGORIES_ENABLED);

    try {
      // Get white labeling main menu links
      const { mainMenuLinks: whiteLabelingMainMenuLinks } = useWhiteLabeling();

      if (whiteLabelingMainMenuLinks.value?.length) {
        // First priority: use white labeling main menu if available
        catalogMenuItems.value = whiteLabelingMainMenuLinks.value;
      } else if (catalog_menu_link_list_name && typeof catalog_menu_link_list_name === "string") {
        // Second priority: use XAPI catalog menu link list setting
        catalogMenuItems.value = (await getMenu(catalog_menu_link_list_name)).map((item) =>
          convertToExtendedMenuLink(item as MenuLinkType, true),
        );
      } else {
        // Third priority: use category-based menu (query `childCategories`, with `maxLevel` equal to 2)
        const catalogId = themeContext.value.catalogId;
        const currencyCode = currentCurrency.value.code;

        const productFilter = catalog_empty_categories_enabled
          ? undefined
          : [
              getFilterExpressionForCategorySubtree({ catalogId }),
              getFilterExpressionForZeroPrice(!!zero_price_product_enabled, currencyCode),
              getFilterExpressionForInStockVariations(true),
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

    // Desktop
    desktopMainMenuItems,
    desktopPurchasingMenuItems: createDesktopMenuComputed("purchasing"),
    desktopMarketingMenuItems: createDesktopMenuComputed("marketing"),
    desktopUserMenuItems: createDesktopMenuComputed("user"),
    desktopCorporateMenuItems: createDesktopMenuComputed("corporate"),

    // Mobile
    mobileMainMenuItems,
    mobileCatalogMenuItem,
    mobilePurchasingMenuItem,
    mobileMarketingMenuItem,
    mobileUserMenuItem,
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
