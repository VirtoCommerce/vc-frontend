import { useLocalStorage } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";
import { computed } from "vue";
import { useThemeContext } from "@/core/composables";
import { CONFIG_PRODUCTS_TO_COMPARE_LOCAL_STORAGE, PRODUCT_COMPARE_LIST_IDS_LOCAL_STORAGE } from "@/core/constants";
import { truncate } from "@/core/utilities";
import { compareConfigurationInputs } from "@/shared/catalog/utilities/compareConfiguration";
import { useNotifications } from "@/shared/notification";
import type { IConfigurationProperty, IConfigProductToCompare } from "../types";
import type { Product, ConfigurationSectionInput } from "@/core/api/graphql/types";

const NOTIFICATIONS_GROUP = "compare-products";
const DEFAULT_MAX_PRODUCTS = 5;
const NAME_MAX_LENGTH = 60;

const productsIds = useLocalStorage<string[]>(PRODUCT_COMPARE_LIST_IDS_LOCAL_STORAGE, []);
const configProductsToCompare = useLocalStorage<IConfigProductToCompare[]>(
  CONFIG_PRODUCTS_TO_COMPARE_LOCAL_STORAGE,
  [],
);

function addRegularProductToCompare(product: Product) {
  if (productsIds.value.includes(product.id)) {
    return;
  }
  productsIds.value.push(product.id);
}

function removeRegularProductFromCompare(product: Product) {
  const index = productsIds.value.indexOf(product.id);
  if (index !== -1) {
    productsIds.value.splice(index, 1);
  }
}

function removeConfiguredProductFromCompare(product: Product, configuration?: ConfigurationSectionInput[]) {
  const index = findMatchingConfigProductIndex(product, configuration);

  if (index !== -1) {
    configProductsToCompare.value.splice(index, 1);
  }
}

function addConfiguredProductToCompare(
  product: Product,
  configurationSectionsInput?: ConfigurationSectionInput[],
  properties?: IConfigurationProperty[],
) {
  if (isInCompareList(product, configurationSectionsInput)) {
    return;
  }

  configProductsToCompare.value.push({
    id: uuidv4(),
    productId: product.id,
    configurationSectionInput: configurationSectionsInput,
    properties: properties ?? [],
  });
}

function isInCompareList(product: Product, configuration?: ConfigurationSectionInput[]) {
  if (product.isConfigurable && configuration) {
    return findMatchingConfigProductIndex(product, configuration) !== -1;
  }
  return productsIds.value.includes(product.id);
}

function findMatchingConfigProductIndex(product: Product, configuration?: ConfigurationSectionInput[]) {
  if (!configuration) {
    return -1;
  }

  return configProductsToCompare.value.findIndex((configProduct) => {
    if (configProduct.productId !== product.id) {
      return false;
    }

    if (!configProduct.configurationSectionInput?.length) {
      return false;
    }

    return configuration.every((section) => {
      const matched = configProduct.configurationSectionInput?.find((s) => s.sectionId === section.sectionId);
      return matched ? compareConfigurationInputs(section, matched) : false;
    });
  });
}

export function useCompareProducts() {
  const { themeContext } = useThemeContext();
  const notifications = useNotifications();
  const productsLimit = themeContext.value?.settings?.product_compare_limit || DEFAULT_MAX_PRODUCTS;

  function addToCompareList(
    product: Product,
    configurationSections?: ConfigurationSectionInput[],
    properties?: IConfigurationProperty[],
  ) {
    if (productsIds.value.length + configProductsToCompare.value.length >= productsLimit) {
      notifications.warning({
        duration: 15000,
        group: NOTIFICATIONS_GROUP,
        singleInGroup: true,
        text: `Only ${productsLimit} products can be compared`,
      });

      return;
    }

    if (product.isConfigurable && configurationSections?.length) {
      addConfiguredProductToCompare(product, configurationSections, properties);
    } else {
      addRegularProductToCompare(product);
    }

    notifications.success({
      duration: 15000,
      group: NOTIFICATIONS_GROUP,
      singleInGroup: true,
      html:
        `Product <span class="hidden lg:inline">“<strong>${truncate(product.name, NAME_MAX_LENGTH)}</strong>”</span> ` +
        `is added to compare list ` +
        `<span class="hidden lg:inline">(${productsLimit - productsIds.value.length - configProductsToCompare.value.length} items left)</span>`,
      button: {
        text: "Compare",
        to: { path: "/compare" },
        clickHandler() {
          notifications.clear(NOTIFICATIONS_GROUP);
        },
      },
    });
  }

  function removeFromCompareList(product: Product, configurationSections?: ConfigurationSectionInput[]) {
    if (product.isConfigurable && configurationSections?.length) {
      removeConfiguredProductFromCompare(product, configurationSections);
    } else {
      removeRegularProductFromCompare(product);
    }

    notifications.warning({
      duration: 15000,
      group: NOTIFICATIONS_GROUP,
      singleInGroup: true,
      html:
        `Product <span class="hidden lg:inline">“<strong>${truncate(product.name, NAME_MAX_LENGTH)}</strong>”</span> ` +
        `was removed from the compare list`,
    });
  }

  function clearCompareList() {
    productsIds.value = [];
    configProductsToCompare.value = [];
  }

  return {
    addToCompareList,
    removeFromCompareList,
    clearCompareList,
    isInCompareList,

    productsLimit,
    productsIds: computed(() => productsIds.value.slice(0, productsLimit - configProductsToCompare.value.length)),
    configProductsToCompare: computed(() =>
      configProductsToCompare.value.slice(0, productsLimit - productsIds.value.length),
    ),
  };
}
