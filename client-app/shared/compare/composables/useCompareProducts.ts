import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";
import { useThemeContext } from "@/core/composables";
import { truncate } from "@/core/utilities";
import { useConfigurableProduct } from "@/shared/catalog/composables";
import { useNotifications } from "@/shared/notification";
import type { Product, ConfigurationSectionInput } from "@/core/api/graphql/types";

const NOTIFICATIONS_GROUP = "compare-pruducts";
const DEFAULT_MAX_PRODUCTS = 5;
const NAME_MAX_LENGTH = 60;

interface IConfigProductToCompare {
  productId: string;
  configurationSections: ConfigurationSectionInput[];
}

const productsIds = useLocalStorage<string[]>("productCompareListIds", []);
const configProductsToCompare = useLocalStorage<IConfigProductToCompare[]>("configProductsToCompare", []);

function addToCompareProductsRegularProduct(product: Product) {
  if (productsIds.value.includes(product.id)) {
    return;
  }
  productsIds.value.push(product.id);
}

function removeFromCompareProductsRegularProduct(product: Product) {
  const index = productsIds.value.indexOf(product.id);
  if (index !== -1) {
    productsIds.value.splice(index, 1);
  }
}

function removeFromCompareProductsConfigurableProduct(
  product: Product,
  configurationSections?: ConfigurationSectionInput[],
) {
  const index = configProductsToCompare.value.findIndex(
    (cp) => cp.productId === product.id && cp.configurationSections.every((s) => configurationSections?.includes(s)),
  );
  if (index !== -1) {
    configProductsToCompare.value.splice(index, 1);
  }
}

function addToCompareProductsConfigurableProduct(
  product: Product,
  configurationSections?: ConfigurationSectionInput[],
) {
  if (isInCompareList(product, configurationSections)) {
    return;
  }
  configProductsToCompare.value.push({
    productId: product.id,
    configurationSections: configurationSections || [],
  });
}

function isInCompareList(product: Product, configurationSections?: ConfigurationSectionInput[]) {
  const { compareInputs } = useConfigurableProduct(product.id);

  if (product.isConfigurable && configurationSections) {
    return configProductsToCompare.value.some((configProduct) => {
      return (
        configProduct.productId === product.id &&
        configurationSections.every((section) => {
          return compareInputs(
            section,
            configProduct.configurationSections.find((s) => s.sectionId === section.sectionId) || {
              sectionId: section.sectionId,
              type: "",
            },
          );
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

  function addToCompareList(product: Product, configurationSections?: ConfigurationSectionInput[]) {
    if (productsIds.value.length + configProductsToCompare.value.length >= productsLimit) {
      notifications.warning({
        duration: 15000,
        group: NOTIFICATIONS_GROUP,
        singleInGroup: true,
        text: `Only ${productsLimit} products can be compared`,
      });

      return;
    }

    if (product.isConfigurable) {
      addToCompareProductsConfigurableProduct(product, configurationSections);
    } else {
      addToCompareProductsRegularProduct(product);
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
    if (product.isConfigurable) {
      removeFromCompareProductsConfigurableProduct(product, configurationSections);
    } else {
      removeFromCompareProductsRegularProduct(product);
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
