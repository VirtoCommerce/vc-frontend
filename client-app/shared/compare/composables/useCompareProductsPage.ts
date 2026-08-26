import { useMutation } from "@vue/apollo-composable";
import { uniqBy } from "lodash-es";
import { computed, ref, shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { CreateConfiguredLineItemDocument } from "@/core/api/graphql/types";
import { useAnalytics } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MAX_DISPLAY_IN_STOCK_QUANTITY } from "@/core/constants";
import { ProductType } from "@/core/enums";
import { globals } from "@/core/globals";
import { getPropertyValue, Logger } from "@/core/utilities";
import {
  ENABLED_KEY as CUSTOMER_REVIEWS_ENABLED_KEY,
  MODULE_ID as CUSTOMER_REVIEWS_MODULE_ID,
} from "@/modules/customer-reviews/constants";
import { useProducts } from "@/shared/catalog/composables/useProducts";
import { getDisplayPrice, getProductCategoryLabel } from "../utilities";
import { useCompareProducts } from "./useCompareProducts";
import type { ICompareCategoryTab, ICompareDisplayProduct, ICompareProductEntry, ICompareTableRow } from "../types";
import type { CreateConfiguredLineItemMutation, MoneyType, Product } from "@/core/api/graphql/types";

const EMPTY_VALUE_PLACEHOLDER = "–";

type ConfiguredLineItemType = CreateConfiguredLineItemMutation["createConfiguredLineItem"];

function getProductPropertyValue(product: Product, propertyName: string): string {
  const property = product.properties.find((prop) => prop.name.toLowerCase() === propertyName);
  return property ? (getPropertyValue(property) ?? EMPTY_VALUE_PLACEHOLDER) : EMPTY_VALUE_PLACEHOLDER;
}

function getAvailabilitySignature(product: Product): string {
  if (product.productType === ProductType.Digital) {
    return "digital";
  }

  if (!product.availabilityData.isInStock) {
    return `out-of-stock:${product.availabilityData.isAvailable}`;
  }

  const quantity = product.availabilityData.availableQuantity;
  const displayQuantity = quantity > MAX_DISPLAY_IN_STOCK_QUANTITY ? `${MAX_DISPLAY_IN_STOCK_QUANTITY}+` : quantity;
  return `in-stock:${displayQuantity}`;
}

function getConfigPropertyValue(entry: ICompareProductEntry, label: string): string {
  const property = entry.properties?.find((prop) => prop.label === label);
  return property?.value ?? EMPTY_VALUE_PLACEHOLDER;
}

function applyPriceOverride(
  originalPrice: MoneyType,
  overridePrice?: NonNullable<ConfiguredLineItemType>["salePrice"],
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

// Price can differ per selected configuration (option price deltas), so the base product.price
// isn't enough for a configured entry.
function withConfiguredPrice(product: Product, configuredLineItem?: ConfiguredLineItemType): Product {
  if (!configuredLineItem) {
    return product;
  }

  return {
    ...product,
    price: {
      ...product.price,
      actual: applyPriceOverride(product.price.actual, configuredLineItem.salePrice),
      list: applyPriceOverride(product.price.list, configuredLineItem.listPrice),
    },
  };
}

export function useCompareProductsPage() {
  const { t, n } = useI18n();
  const route = useRoute();
  const { products, getCategoryProductsCount } = useCompareProducts();
  const { fetchProducts, products: fetchedProducts, fetchingProducts } = useProducts();
  const { isEnabled } = useModuleSettings(CUSTOMER_REVIEWS_MODULE_ID);
  const customerRatingEnabled = isEnabled(CUSTOMER_REVIEWS_ENABLED_KEY);
  const { mutate: createConfiguredLineItemMutation } = useMutation(CreateConfiguredLineItemDocument);
  const { storeId, currencyCode, cultureName } = globals;
  const { analytics } = useAnalytics();

  const productIds = computed(() => products.value.map((entry) => entry.productId));

  const configuredEntries = computed(() =>
    products.value.filter((entry) => entry.localId && entry.configurationSectionInput?.length),
  );

  const configuredLineItemsByLocalId = shallowRef<Record<string, ConfiguredLineItemType>>({});

  watch(
    configuredEntries,
    async (entries) => {
      if (!entries.length) {
        return;
      }

      try {
        const responses = await Promise.all(
          entries.map((entry) =>
            createConfiguredLineItemMutation({
              command: {
                configurableProductId: entry.productId,
                configurationSections: entry.configurationSectionInput,
                storeId,
                currencyCode,
                cultureName,
              },
            }),
          ),
        );

        const nextConfiguredLineItems: Record<string, ConfiguredLineItemType> = {};
        entries.forEach((entry, index) => {
          if (entry.localId) {
            nextConfiguredLineItems[entry.localId] = responses[index]?.data?.createConfiguredLineItem;
          }
        });
        configuredLineItemsByLocalId.value = nextConfiguredLineItems;
      } catch (e) {
        Logger.error("useCompareProductsPage.fetchConfiguredLineItems", e);
      }
    },
    { immediate: true },
  );

  const categoryTabs = computed<ICompareCategoryTab[]>(() => {
    const tabsByCategoryKey = new Map<string, ICompareCategoryTab>();

    products.value.forEach((entry) => {
      if (tabsByCategoryKey.has(entry.categoryKey)) {
        return;
      }

      const product = fetchedProducts.value.find((_product) => _product.id === entry.productId);

      tabsByCategoryKey.set(entry.categoryKey, {
        categoryKey: entry.categoryKey,
        label: product ? getProductCategoryLabel(product) : "",
        count: getCategoryProductsCount(entry.categoryKey),
      });
    });

    return Array.from(tabsByCategoryKey.values());
  });

  // Seeded from ?category= when arriving via the "added to compare" toast's button (see
  // addToCompareList in useCompareProducts.ts), so it opens straight into that product's
  // category instead of whichever one would otherwise be picked by default.
  const initialCategoryKey = typeof route.query.category === "string" ? route.query.category : "";
  const selectedCategoryKey = ref(initialCategoryKey);

  const selectedCategoryTab = computed(() =>
    categoryTabs.value.find((tab) => tab.categoryKey === selectedCategoryKey.value),
  );

  const selectedCategoryLabel = computed(() => selectedCategoryTab.value?.label ?? "");
  const selectedCategoryCount = computed(() => selectedCategoryTab.value?.count ?? 0);

  // One item per compare entry, not per unique product id — the same product can be in the list
  // several times with different configurations, and each of those needs its own column.
  const selectedCategoryProducts = computed<ICompareDisplayProduct[]>(() =>
    products.value
      .filter((entry) => entry.categoryKey === selectedCategoryKey.value)
      .map((entry) => {
        const product = fetchedProducts.value.find((_product) => _product.id === entry.productId);

        if (!product) {
          return null;
        }

        const configuredLineItem = entry.localId ? configuredLineItemsByLocalId.value[entry.localId] : undefined;
        return { product: withConfiguredPrice(product, configuredLineItem), entry };
      })
      .filter((item): item is ICompareDisplayProduct => item !== null),
  );

  const customFieldRows = computed<ICompareTableRow[]>(() => {
    const items = selectedCategoryProducts.value;

    if (!items.length) {
      return [];
    }

    function makeRow(key: string, label: string, kind: ICompareTableRow["kind"], values: string[]): ICompareTableRow {
      return { key, label, kind, values, differs: new Set(values).size > 1 };
    }

    const rows: ICompareTableRow[] = [
      makeRow(
        "price",
        t("shared.compare.table.fields.price_per_unit"),
        "price",
        items.map(({ product }) => getDisplayPrice(product).actual.formattedAmount),
      ),
    ];

    if (customerRatingEnabled && items.some(({ product }) => product.rating)) {
      rows.push(
        makeRow(
          "rating",
          t("shared.compare.table.fields.customer_rating"),
          "rating",
          items.map(({ product }) =>
            product.rating
              ? n(product.rating.value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
              : EMPTY_VALUE_PLACEHOLDER,
          ),
        ),
      );
    }

    rows.push(
      makeRow(
        "availability",
        t("shared.compare.table.fields.availability"),
        "availability",
        items.map(({ product }) => getAvailabilitySignature(product)),
      ),
      makeRow(
        "sku",
        t("shared.compare.table.fields.sku"),
        "text",
        items.map(({ product }) => product.code || EMPTY_VALUE_PLACEHOLDER),
      ),
      makeRow(
        "minOrderQty",
        t("shared.compare.table.fields.min_order_qty"),
        "text",
        items.map(({ product }) => (product.minQuantity != null ? n(product.minQuantity) : EMPTY_VALUE_PLACEHOLDER)),
      ),
    );

    return rows;
  });

  const propertyRows = computed<ICompareTableRow[]>(() => {
    const propertyNames = uniqBy(
      selectedCategoryProducts.value.flatMap(({ product }) =>
        product.properties.map((prop) => ({ name: prop.name.toLowerCase(), label: prop.label })),
      ),
      "name",
    );

    return propertyNames.map(({ name, label }) => {
      const values = selectedCategoryProducts.value.map(({ product }) => getProductPropertyValue(product, name));

      return {
        key: name,
        label,
        kind: "text" as const,
        values,
        differs: new Set(values).size > 1,
      };
    });
  });

  const configPropertyRows = computed<ICompareTableRow[]>(() => {
    const items = selectedCategoryProducts.value;
    const configPropertyLabels = uniqBy(
      items.flatMap(({ entry }) => entry.properties ?? []),
      "label",
    ).map((prop) => prop.label);

    return configPropertyLabels.map((label) => {
      const values = items.map(({ entry }) => getConfigPropertyValue(entry, label));

      return {
        key: `config:${label}`,
        label,
        kind: "text" as const,
        values,
        differs: new Set(values).size > 1,
      };
    });
  });

  const tableRows = computed<ICompareTableRow[]>(() => [
    ...customFieldRows.value,
    ...propertyRows.value,
    ...configPropertyRows.value,
  ]);

  const differRowsCount = computed(() => tableRows.value.filter((row) => row.differs).length);

  const compareProductsListProperties = computed(() => ({
    item_list_id: "compare_products",
    item_list_name: t("pages.compare.title"),
  }));

  function selectItemEvent(product: Product) {
    analytics("selectItem", product, compareProductsListProperties.value);
  }

  watch(
    selectedCategoryProducts,
    (items) => {
      if (!items.length) {
        return;
      }

      analytics(
        "viewItemList",
        items.map(({ product }) => product),
        compareProductsListProperties.value,
      );
    },
    { immediate: true },
  );

  function selectCategory(categoryKey: string) {
    selectedCategoryKey.value = categoryKey;
  }

  watch(
    categoryTabs,
    (tabs) => {
      if (!tabs.length) {
        return;
      }

      if (!tabs.some((tab) => tab.categoryKey === selectedCategoryKey.value)) {
        selectedCategoryKey.value = tabs[0]?.categoryKey ?? "";
      }
    },
    { immediate: true },
  );

  watch(
    productIds,
    async (ids) => {
      if (!ids.length) {
        return;
      }

      try {
        await fetchProducts({ productIds: ids });
      } catch (e) {
        Logger.error("useCompareProductsPage.fetchProducts", e);
      }
    },
    { immediate: true },
  );

  return {
    categoryTabs,
    selectedCategoryKey,
    selectedCategoryLabel,
    selectedCategoryCount,
    selectedCategoryProducts,
    tableRows,
    differRowsCount,
    fetchingProducts,
    selectCategory,
    selectItemEvent,
  };
}
