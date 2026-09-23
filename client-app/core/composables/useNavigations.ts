import { createGlobalState } from "@vueuse/core";
import { clone, cloneDeep, mergeWith } from "lodash-es";
import { computed, readonly, ref, shallowRef, triggerRef } from "vue";
import menuData from "@/config/menu.json";
import { getChildCategories, getMenu } from "@/core/api/graphql";
import { useCurrency } from "@/core/composables/useCurrency";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useModules } from "@/core/composables/useModules";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { useWhiteLabeling } from "@/core/composables/useWhiteLabeling";
import { MODULE_ID_MARKETING_EXPERIENCE_API, MODULE_XAPI_KEYS } from "@/core/constants/modules";
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
  AccountNavigationSectionType,
  ExtendedMenuLinkType,
  MenuType,
  MarkedMenuLinkType,
  MenuSecionType,
  MobileMenuSectionType,
  DesktopMenuSectionType,
} from "../types";
import type { DeepPartial } from "utility-types";
import type { RouteLocationNormalizedLoaded } from "vue-router";

// Module scope rather than inside the composable, so the host-only declaration helpers below reach
// the same state without widening `useNavigations`, which the facade publishes to plugins.
const menuSchema = shallowRef<MenuType | null>(menuData);
// Account left-rail sections contributed by modules (e.g. the Sales Rep hub).
// shallowRef so the sections' `isVisible` ComputedRefs aren't unwrapped by ref's deep typing.
const registeredAccountSections = shallowRef<AccountNavigationSectionType[]>([]);

/**
 * Entries the host added from a plugin's declared contributions, before the plugin ran. The
 * plugin's own registration under the same id replaces them instead of being duplicated (links) or
 * refused (sections); anything the plugin never claimed is withdrawn if it fails.
 */
const declaredLinkIds = new Set<string>();
const declaredSectionIds = new Set<string>();

function mergeIntoMenuSchema(additionalSchema: DeepPartial<MenuType>) {
  menuSchema.value = mergeWith(menuSchema.value, additionalSchema, (objValue: unknown, srcValue: unknown) => {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      const incoming = new Set((srcValue as ExtendedMenuLinkType[]).map((link) => link?.id).filter(Boolean));
      const kept = (objValue as ExtendedMenuLinkType[]).filter(
        (link) => !(link?.id && declaredLinkIds.has(link.id) && incoming.has(link.id)),
      );
      return kept.concat(srcValue);
    }
  });
  triggerRef(menuSchema);
}

function removeLinks(links: ExtendedMenuLinkType[] | undefined, ids: Set<string>): ExtendedMenuLinkType[] | undefined {
  return links
    ?.filter((link) => !(link.id && ids.has(link.id)))
    .map((link) => (link.children ? { ...link, children: removeLinks(link.children, ids) } : link));
}

/** Host-only: header links declared by a plugin, identified by `ids` so they can be withdrawn. */
export function declareMenuLinks(schema: DeepPartial<MenuType>, ids: readonly string[]): void {
  mergeIntoMenuSchema(schema);
  ids.forEach((id) => declaredLinkIds.add(id));
}

/** Host-only: an account section declared by a plugin; the plugin's own registration replaces it. */
export function declareAccountSection(section: AccountNavigationSectionType): void {
  if (registeredAccountSections.value.some((x) => x.id === section.id)) {
    Logger.warn(`[useNavigations] account section "${section.id}" is already registered; ignoring the declaration.`);
    return;
  }
  declaredSectionIds.add(section.id);
  registeredAccountSections.value = [...registeredAccountSections.value, section];
}

/** Host-only: drops whatever of these declarations the plugin did not register itself. */
export function withdrawDeclaredNavigation(linkIds: readonly string[], sectionIds: readonly string[]): void {
  const links = new Set(linkIds.filter((id) => declaredLinkIds.has(id)));
  if (links.size && menuSchema.value) {
    const { desktop, mobile } = menuSchema.value.header;
    const strip = (section: Record<string, ExtendedMenuLinkType | ExtendedMenuLinkType[]>) =>
      Object.fromEntries(
        Object.entries(section).map(([key, value]) => [
          key,
          Array.isArray(value) ? removeLinks(value, links) : { ...value, children: removeLinks(value.children, links) },
        ]),
      );
    menuSchema.value = {
      ...menuSchema.value,
      header: {
        desktop: strip(desktop) as MenuType["header"]["desktop"],
        mobile: strip(mobile) as MenuType["header"]["mobile"],
      },
    };
    links.forEach((id) => declaredLinkIds.delete(id));
  }
  const sections = new Set(sectionIds.filter((id) => declaredSectionIds.has(id)));
  if (sections.size) {
    registeredAccountSections.value = registeredAccountSections.value.filter((x) => !sections.has(x.id));
    sections.forEach((id) => declaredSectionIds.delete(id));
  }
}

export function _useNavigations() {
  const { currentCurrency } = useCurrency();

  const matchingRouteName = ref("");
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

  const { hasModule } = useModules();

  function createMenuComputed(type: "desktop" | "mobile", key: MenuSecionType) {
    return computed<ExtendedMenuLinkType | undefined>(() => {
      const raw = menuSchema.value?.header?.[type]?.[key];

      if (!raw) {
        return undefined;
      }

      const schema = clone(getTranslatedMenuLink(raw));

      if (Array.isArray(schema.children)) {
        if (key === "marketing" && !hasModule(MODULE_ID_MARKETING_EXPERIENCE_API)) {
          schema.children = schema.children.filter((child) => child.id !== "promotion-coupons");
        }

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

  // Registered account sections (e.g. Sales Rep hub), visibility-filtered and translated for the
  // mobile drill-down. Clone children first — getTranslatedMenuLink mutates its shared-registry input.
  // `priority` is intentionally not applied here: mobile prepends in registration order (desktop is
  // the priority-ordered path — see AccountNavigationSectionType.priority).
  const mobileRegisteredAccountSections = computed<ExtendedMenuLinkType[]>(() =>
    registeredAccountSections.value
      .filter((section) => !section.isVisible || section.isVisible.value)
      .map((section) =>
        getTranslatedMenuLink({
          id: section.id,
          title: section.title,
          icon: section.icon,
          children: cloneDeep(section.children),
        }),
      ),
  );

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

    // Then search in section children — registered sections (e.g. Sales Rep hub) lead, matching the
    // rendered order, so a rep on /company/my-customers auto-opens the hub like built-in routes do.
    const sections = [
      ...mobileRegisteredAccountSections.value,
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
    mergeIntoMenuSchema(additionalSchema);
  }

  // Registers an account left-rail section (idempotent by id). Modules call this at init. A section
  // the host declared on the plugin's behalf is replaced by the plugin's own.
  function registerAccountSection(section: AccountNavigationSectionType) {
    if (declaredSectionIds.has(section.id)) {
      declaredSectionIds.delete(section.id);
      registeredAccountSections.value = registeredAccountSections.value.map((x) => (x.id === section.id ? section : x));
      return;
    }
    if (registeredAccountSections.value.some((x) => x.id === section.id)) {
      Logger.warn(`[useNavigations] account section "${section.id}" is already registered; ignoring.`);
      return;
    }
    registeredAccountSections.value = [...registeredAccountSections.value, section];
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
    mobileRegisteredAccountSections,
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
    registerAccountSection,
    registeredAccountSections: computed(() => registeredAccountSections.value),
  };
}

export const useNavigations = createGlobalState(_useNavigations);
