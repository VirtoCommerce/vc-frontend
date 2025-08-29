import { useLocalStorage } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";
import { computed } from "vue";
import { useThemeContext } from "@/core/composables";
import { truncate } from "@/core/utilities";
import { useConfigurableProduct } from "@/shared/catalog/composables";
import { useNotifications } from "@/shared/notification";
import type { IConfigurationProperty, IConfigProductToCompare } from "../types";
import type { Product, ConfigurationSectionInput } from "@/core/api/graphql/types";

const NOTIFICATIONS_GROUP = "compare-products";
const DEFAULT_MAX_PRODUCTS = 5;
const NAME_MAX_LENGTH = 60;

const LS_COMPARE_REGULAR_IDS = "productCompareListIds";
const LS_COMPARE_CONFIG_PRODUCTS = "configProductsToCompare";

const productsIds = useLocalStorage<string[]>(LS_COMPARE_REGULAR_IDS, []);
const configProductsToCompare = useLocalStorage<IConfigProductToCompare[]>(LS_COMPARE_CONFIG_PRODUCTS, []);

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
  const { compareInputs } = useConfigurableProduct(product.id);

  const index = configProductsToCompare.value.findIndex((configProduct) => {
    if (configProduct.productId !== product.id) {
      return false;
    }

    if (!configuration?.length || !configProduct.configurationSectionInput?.length) {
      return false;
    }

    return configuration.every((section) => {
      const matched = configProduct.configurationSectionInput?.find((s) => s.sectionId === section.sectionId);
      return matched && compareInputs(section, matched);
    });
  });

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
  const { compareInputs } = useConfigurableProduct(product.id);

  if (product.isConfigurable && configuration) {
    return configProductsToCompare.value.some((configProduct) => {
      return (
        configProduct.productId === product.id &&
        configuration.every((section) => {
          const matched = configProduct.configurationSectionInput?.find((s) => s.sectionId === section.sectionId);
          return matched && compareInputs(section, matched);
        })
      );
    });
  }
  return productsIds.value.includes(product.id);
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
