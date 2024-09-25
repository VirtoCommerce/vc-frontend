import _ from "lodash";
import { computed, readonly, ref, shallowRef, triggerRef } from "vue";
import { useFetch } from "@/core/api/common";
import { getChildCategories, getMenu } from "@/core/api/graphql";
import { useThemeContext } from "@/core/composables/useThemeContext";
import {
  convertToExtendedMenuLink,
  getFilterExpressionForCategorySubtree,
  getFilterExpressionForInStock,
  getFilterExpressionForZeroPrice,
  Logger,
  categoryToExtendedMenuLink,
  getTranslatedMenuLink,
} from "@/core/utilities";
import { useUser } from "@/shared/account/composables/useUser";
import { globals } from "../globals";
import type { ExtendedMenuLinkType, MenuType } from "../types";
import type { DeepPartial } from "utility-types";

const loading = ref(false);
const matchingRouteName = ref("");
const menuSchema = ref<MenuType | null>(null);
const catalogMenuItems = shallowRef<ExtendedMenuLinkType[]>([]);
const openedMenuItemsStack = shallowRef<ExtendedMenuLinkType[]>([]);
const footerLinks = shallowRef<ExtendedMenuLinkType[]>([]);
const mobileContactOrganizationsMenu = shallowRef<ExtendedMenuLinkType | undefined>();

const openedItem = computed<ExtendedMenuLinkType | undefined>(
  () => openedMenuItemsStack.value[openedMenuItemsStack.value.length - 1],
);

const desktopMainMenuItems = computed<ExtendedMenuLinkType[]>(() =>
  (menuSchema.value?.header?.desktop || [])
    .map((item: ExtendedMenuLinkType) => getTranslatedMenuLink(item))
    .sort((a, b) => (a.priority || 0) - (b.priority || 0)),
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

const mobileAccountMenuItem = computed<ExtendedMenuLinkType | undefined>(() => {
  if (!menuSchema.value) {
    return undefined;
  }

  const translatedMenuLink = getTranslatedMenuLink(menuSchema.value?.header?.mobile?.account);

  if (translatedMenuLink?.children && mobileContactOrganizationsMenu.value) {
    translatedMenuLink.children.splice(1, 0, mobileContactOrganizationsMenu.value);
  }

  return translatedMenuLink;
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

  async function fetchMenuSchema() {
    try {
      const { data } = await useFetch("/config/menu.json").get().json<MenuType>();
      menuSchema.value = data.value;
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
    const { t } = globals.i18n.global;
    const { isMultiOrganization, user } = useUser();

    const organizationsMenuItems = user.value?.contact?.organizations?.items?.map<ExtendedMenuLinkType>((item) => ({
      id: item.id,
      title: item.name,
      isContactOrganizationsItem: true,
    }));

    if (isMultiOrganization.value) {
      mobileContactOrganizationsMenu.value = {
        id: "contact-organizations",
        title: t("common.labels.my_organizations"),
        icon: "/static/images/dashboard/icons/company.svg#main",
        children: organizationsMenuItems,
      };
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

  function mergeMenuSchema(additionalSchema: DeepPartial<MenuType>) {
    menuSchema.value = _.mergeWith(menuSchema.value, additionalSchema, (objValue: unknown, srcValue: unknown) => {
      if (_.isArray(objValue) && _.isArray(srcValue)) {
        return objValue.concat(srcValue) as ExtendedMenuLinkType[];
      }
    });
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

    mergeMenuSchema,
  };
}
