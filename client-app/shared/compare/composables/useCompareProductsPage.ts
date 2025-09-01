import { useMutation } from "@vue/apollo-composable";
import pickBy from "lodash/pickBy";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { CreateConfiguredLineItemDocument } from "@/core/api/graphql/types";
import { useAnalytics } from "@/core/composables";
import { globals } from "@/core/globals";
import { getPropertyValue, Logger } from "@/core/utilities";
import { useProducts } from "@/shared/catalog";
import { useCompareProducts } from "@/shared/compare";
import type { IConfigProductToCompare } from "../types";
import type { CreateConfiguredLineItemMutation, Product, MoneyType } from "@/core/api/graphql/types";

const EMPTY_VALUE_PLACEHOLDER = "–";

interface ICompareProductProperties {
  [key: string]: { label: string; values: string[] };
}

type ConfiguredLineItemType = CreateConfiguredLineItemMutation["createConfiguredLineItem"];

export function useCompareProductsPage() {
  const { t } = useI18n();
  const { storeId, currencyCode, cultureName } = globals;

  const { mutate: createConfiguredLineItemMutation } = useMutation(CreateConfiguredLineItemDocument);
  const { analytics } = useAnalytics();
  const { fetchProducts, products } = useProducts();
  const { removeFromCompareList, productsIds, configProductsToCompare } = useCompareProducts();

  const showOnlyDifferences = ref(false);
  const properties = ref<ICompareProductProperties>({});
  const configProductsConfiguredItems = ref<CreateConfiguredLineItemMutation["createConfiguredLineItem"][]>([]);

  const allProductIdsToShow = computed(() => {
    const configProductsIds = configProductsToCompare.value.map((configProduct) => configProduct.productId);
    return [...productsIds.value, ...configProductsIds];
  });

  const allProductIdsForFetch = computed(() => uniq(allProductIdsToShow.value));

  const productsToShow = computed(() =>
    allProductIdsToShow.value.map(buildProductForDisplay).filter((p): p is Product => p !== null),
  );

  const propertiesDiffs = computed<ICompareProductProperties>(() => {
    return pickBy(properties.value, (prop) => uniq(prop.values).length !== 1);
  });

  const compareProductsListProperties = computed(() => ({
    item_list_id: "compare_products",
    item_list_name: t("pages.compare.header_block.title"),
  }));

  function normalizeProductProperties(product: Product) {
    return {
      ...product,
      properties: product.properties.map((prop) => ({
        ...prop,
        name: prop.name.toLowerCase(),
      })),
    };
  }

  function getConfiguredLineItemByIndex(index: number) {
    const configProductIndex = index - productsIds.value.length;
    return configProductsConfiguredItems.value[configProductIndex];
  }

  function applyPriceOverride(
    originalPrice: MoneyType,
    overridePrice?: {
      amount: number;
      formattedAmount: string;
      formattedAmountWithoutCurrency: string;
    },
  ): MoneyType {
    if (!overridePrice) {
      return originalPrice;
    }
    return {
      ...originalPrice,
      amount: overridePrice.amount,
      formattedAmount: overridePrice.formattedAmount,
      formattedAmountWithoutCurrency: overridePrice.formattedAmountWithoutCurrency,
    };
  }

  function withConfiguredPrices(product: Product, configuredItem?: ConfiguredLineItemType): Product {
    if (!configuredItem || !product.price) {
      return product;
    }

    return {
      ...product,
      price: {
        ...product.price,
        actual: applyPriceOverride(product.price.actual, configuredItem.salePrice),
        list: applyPriceOverride(product.price.list, configuredItem.listPrice),
      },
    };
  }

  function buildProductForDisplay(productId: string, index: number) {
    const product = products.value.find((_product) => _product.id === productId);
    if (!product) {
      return null;
    }

    const normalized = normalizeProductProperties(product);
    const configuredItem = getConfiguredLineItemByIndex(index);
    return withConfiguredPrices(normalized, configuredItem);
  }

  function getConfigurationProductByIndex(index: number) {
    const configProductIndex = index - productsIds.value.length;
    return configProductsToCompare.value[configProductIndex];
  }

  function getProductPropertyValue(product: Product, propertyName: string): string {
    const property = product.properties.find((prop) => prop.name === propertyName);
    return property ? (getPropertyValue(property) ?? EMPTY_VALUE_PLACEHOLDER) : EMPTY_VALUE_PLACEHOLDER;
  }

  function getConfigProductPropertyValue(
    configProduct: IConfigProductToCompare,
    propertyInfo: { name: string; label: string },
  ): string {
    return (
      configProduct.properties.find((prop: { label: string; value?: string }) => prop.label === propertyInfo.name)
        ?.value ?? EMPTY_VALUE_PLACEHOLDER
    );
  }

  async function refreshProducts(): Promise<void> {
    try {
      await fetchProducts({ productIds: allProductIdsForFetch.value });

      const configProductsConfiguredItemsResponses = await Promise.all(
        configProductsToCompare.value.map((configProduct) =>
          createConfiguredLineItemMutation({
            command: {
              configurableProductId: configProduct.productId,
              configurationSections: configProduct.configurationSectionInput,
              storeId,
              currencyCode,
              cultureName,
            },
          }),
        ),
      );
      configProductsConfiguredItems.value = configProductsConfiguredItemsResponses.map(
        (response) => response?.data?.createConfiguredLineItem,
      );

      getProperties();
    } catch (e) {
      Logger.error(refreshProducts.name, e);
    }
  }

  function getProperties() {
    properties.value = {};

    if (!products.value.length) {
      return;
    }

    const normalizedPropertyNames = computeNormalizedPropertyNames();
    const baseProperties = buildBasePropertiesMap(normalizedPropertyNames);
    const configOnlyProperties = buildConfigurationPropertiesMap();

    properties.value = {
      ...baseProperties,
      ...configOnlyProperties,
    };
  }

  function computeNormalizedPropertyNames() {
    const propertiesCombined = products.value.flatMap((product) => product.properties);

    return uniqBy(
      propertiesCombined.map((prop) => ({
        name: prop.name.toLowerCase(),
        label: prop.label,
      })),
      "name",
    );
  }

  function computeConfigurationProductsProperties() {
    return uniqBy(
      configProductsToCompare.value.flatMap((configProduct) => {
        return configProduct.properties.map((prop: { label: string }) => ({
          name: prop.label,
          label: prop.label,
        }));
      }),
      "name",
    );
  }

  function buildBasePropertiesMap(propertiesNames: { name: string; label: string }[]) {
    const map: ICompareProductProperties = {};

    propertiesNames.forEach(({ name, label }) => {
      map[name] = {
        label,
        values: productsToShow.value.map((product) => getProductPropertyValue(product, name)),
      };
    });

    return map;
  }

  function buildConfigurationPropertiesMap() {
    const configurationProductsProperties = computeConfigurationProductsProperties();

    if (!configurationProductsProperties.length) {
      return {};
    }

    const map: ICompareProductProperties = {};
    const regularProductsValuesOffset = Array.from({ length: productsIds.value.length }).fill(
      EMPTY_VALUE_PLACEHOLDER,
    ) as string[];

    configurationProductsProperties.forEach((propertyInfo) => {
      const values = configProductsToCompare.value.map((configProduct) =>
        getConfigProductPropertyValue(configProduct, propertyInfo),
      );

      map[propertyInfo.name] = {
        label: propertyInfo.label,
        values: [...regularProductsValuesOffset, ...values],
      };
    });

    return map;
  }

  function selectItemEvent(product: Product) {
    analytics("selectItem", product, compareProductsListProperties.value);
  }

  function handleRemoveFromCompareList(product: Product, index: number) {
    const isInConfigurableGroup = product.isConfigurable && index >= productsIds.value.length;

    if (isInConfigurableGroup) {
      const configProductIndex = index - productsIds.value.length;
      const configurationSectionInput = configProductsToCompare.value[configProductIndex].configurationSectionInput;
      removeFromCompareList(product, configurationSectionInput);
    } else {
      removeFromCompareList(product);
    }
  }

  function getConfigurationId(product: Product, index: number) {
    const isInConfigurableGroup = product.isConfigurable && index >= productsIds.value.length;
    return isInConfigurableGroup ? getConfigurationProductByIndex(index).localId : undefined;
  }

  watch(allProductIdsToShow, refreshProducts, { immediate: true });

  watch(
    products,
    (productsValue) => {
      if (!productsValue.length) {
        return;
      }

      analytics("viewItemList", productsValue, compareProductsListProperties.value);
    },
    { immediate: true },
  );

  return {
    productsToShow,
    properties,
    propertiesDiffs,
    showOnlyDifferences,
    handleRemoveFromCompareList,
    getConfigurationId,
    selectItemEvent,
  };
}
