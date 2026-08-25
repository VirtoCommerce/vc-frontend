import { useLocalStorage } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { COMPARE_PRODUCTS_LOCAL_STORAGE, LOCAL_PRODUCT_CONFIGURATIONS_LOCAL_STORAGE } from "@/core/constants";
import { truncate } from "@/core/utilities";
import { CONFIGURABLE_SECTION_TYPES } from "@/shared/catalog/constants/configurableProducts";
import { compareConfigurationInputs } from "@/shared/catalog/utilities/configurations";
import { useNotifications } from "@/shared/notification";
import { COMPARE_NOTIFICATION_PRODUCT_NAME_MAX_LENGTH } from "../constants";
import { getProductCategoryKey } from "../utilities";
import type { ICompareProductEntry, IConfigurationProperty } from "../types";
import type { ConfigurationSectionInput, Product } from "@/core/api/graphql/types";
import type { LocalConfigurationType } from "@/shared/catalog/types";

const NOTIFICATIONS_GROUP = "compare-products";
const DEFAULT_MAX_PRODUCTS_PER_CATEGORY = 5;

const products = useLocalStorage<ICompareProductEntry[]>(COMPARE_PRODUCTS_LOCAL_STORAGE, []);
// Shared with product.vue's configuration preselection (CONFIGURATION_URL_SEARCH_PARAM lookup) —
// this composable's own storage isn't the only consumer, so it's kept as a separate constant.
const localProductConfigurations = useLocalStorage<LocalConfigurationType[]>(
  LOCAL_PRODUCT_CONFIGURATIONS_LOCAL_STORAGE,
  [],
);

// In-memory only (not persisted) — lets "Restore products" bring back whatever was just cleared,
// but only for the current page load, matching how the empty-state restore button is meant to work.
const lastRemovedEntries = ref<ICompareProductEntry[]>([]);
const lastRemovedConfigurations = ref<LocalConfigurationType[]>([]);

function withoutFileSections(configuration?: ConfigurationSectionInput[]): ConfigurationSectionInput[] | undefined {
  return configuration?.filter((section) => section.type !== CONFIGURABLE_SECTION_TYPES.file);
}

function findMatchingEntryIndex(product: Product, configuration?: ConfigurationSectionInput[]): number {
  const normalizedConfiguration = withoutFileSections(configuration);

  if (product.isConfigurable && normalizedConfiguration?.length) {
    return products.value.findIndex((entry) => {
      if (entry.productId !== product.id || !entry.configurationSectionInput?.length) {
        return false;
      }

      return normalizedConfiguration.every((section) => {
        const matched = entry.configurationSectionInput?.find((s) => s.sectionId === section.sectionId);
        return matched ? compareConfigurationInputs(section, matched) : false;
      });
    });
  }

  return products.value.findIndex((entry) => entry.productId === product.id && !entry.localId);
}

function isInCompareList(product: Product, configuration?: ConfigurationSectionInput[]): boolean {
  return findMatchingEntryIndex(product, configuration) !== -1;
}

function getCategoryEntries(categoryKey: string): ICompareProductEntry[] {
  return products.value.filter((entry) => entry.categoryKey === categoryKey);
}

export function useCompareProducts() {
  const { themeContext } = useThemeContext();
  const notifications = useNotifications();
  const { t } = useI18n();

  const productsLimit = themeContext.value?.settings?.product_compare_limit || DEFAULT_MAX_PRODUCTS_PER_CATEGORY;

  const clampedProducts = computed<ICompareProductEntry[]>(() => {
    const countByCategory = new Map<string, number>();

    return products.value.filter((entry) => {
      const count = countByCategory.get(entry.categoryKey) ?? 0;

      if (count >= productsLimit) {
        return false;
      }

      countByCategory.set(entry.categoryKey, count + 1);
      return true;
    });
  });

  function addToCompareList(
    product: Product,
    configurationSectionInput?: ConfigurationSectionInput[],
    properties?: IConfigurationProperty[],
  ) {
    if (isInCompareList(product, configurationSectionInput)) {
      return;
    }

    const categoryKey = getProductCategoryKey(product);
    const categoryProductsCount = getCategoryEntries(categoryKey).length;

    if (categoryProductsCount >= productsLimit) {
      notifications.warning({
        duration: 15000,
        group: NOTIFICATIONS_GROUP,
        singleInGroup: true,
        text: t("shared.compare.notifications.limit_reached", { productsLimit }),
      });

      return;
    }

    const normalizedConfiguration = withoutFileSections(configurationSectionInput);

    if (product.isConfigurable && normalizedConfiguration?.length) {
      const localId = uuidv4();

      products.value.push({
        productId: product.id,
        categoryKey,
        localId,
        configurationSectionInput: normalizedConfiguration,
        properties: properties ?? [],
      });

      localProductConfigurations.value.push({
        localId,
        configuration: normalizedConfiguration.map((section) => ({
          ...section,
          ...section.option,
          id: section.sectionId,
        })),
      });
    } else {
      products.value.push({ productId: product.id, categoryKey });
    }

    notifications.success({
      duration: 15000,
      group: NOTIFICATIONS_GROUP,
      singleInGroup: true,
      html: t("shared.compare.notifications.added_html", {
        productName: truncate(product.name, COMPARE_NOTIFICATION_PRODUCT_NAME_MAX_LENGTH),
        itemsLeft: productsLimit - categoryProductsCount - 1,
      }),
      button: {
        text: t("shared.compare.notifications.compare_button"),
        to: { path: "/compare" },
        clickHandler() {
          notifications.clear(NOTIFICATIONS_GROUP);
        },
      },
    });
  }

  function removeFromCompareList(product: Product, configuration?: ConfigurationSectionInput[]) {
    const index = findMatchingEntryIndex(product, configuration);

    if (index === -1) {
      return;
    }

    const { localId } = products.value[index];
    products.value.splice(index, 1);

    if (localId) {
      const configurationIndex = localProductConfigurations.value.findIndex((config) => config.localId === localId);

      if (configurationIndex !== -1) {
        localProductConfigurations.value.splice(configurationIndex, 1);
      }
    }

    notifications.warning({
      duration: 15000,
      group: NOTIFICATIONS_GROUP,
      singleInGroup: true,
      html: t("shared.compare.notifications.removed_html", {
        productName: truncate(product.name, COMPARE_NOTIFICATION_PRODUCT_NAME_MAX_LENGTH),
      }),
    });
  }

  function clearCompareList() {
    if (!products.value.length) {
      return;
    }

    lastRemovedEntries.value = products.value;
    lastRemovedConfigurations.value = localProductConfigurations.value;
    products.value = [];
    localProductConfigurations.value = [];
  }

  function clearCategory(categoryKey: string) {
    const categoryEntries = getCategoryEntries(categoryKey);

    if (!categoryEntries.length) {
      return;
    }

    // Clearing the only remaining category empties the whole list — same situation as
    // clearCompareList, so it should be restorable the same way.
    const isLastCategory = categoryEntries.length === products.value.length;
    const localIds = new Set(categoryEntries.map((entry) => entry.localId).filter(Boolean));
    const categoryConfigurations = localProductConfigurations.value.filter((config) => localIds.has(config.localId));

    products.value = products.value.filter((entry) => entry.categoryKey !== categoryKey);
    localProductConfigurations.value = localProductConfigurations.value.filter(
      (config) => !localIds.has(config.localId),
    );

    if (isLastCategory) {
      lastRemovedEntries.value = categoryEntries;
      lastRemovedConfigurations.value = categoryConfigurations;
    }
  }

  function restoreProducts() {
    if (!lastRemovedEntries.value.length) {
      return;
    }

    products.value = [...products.value, ...lastRemovedEntries.value];
    localProductConfigurations.value = [...localProductConfigurations.value, ...lastRemovedConfigurations.value];

    lastRemovedEntries.value = [];
    lastRemovedConfigurations.value = [];
  }

  return {
    addToCompareList,
    removeFromCompareList,
    isInCompareList,
    clearCompareList,
    clearCategory,
    restoreProducts,
    canRestoreProducts: computed(() => lastRemovedEntries.value.length > 0),

    productsLimit,
    products: clampedProducts,
    getCategoryProductsCount: (categoryKey: string) =>
      clampedProducts.value.filter((entry) => entry.categoryKey === categoryKey).length,
  };
}
