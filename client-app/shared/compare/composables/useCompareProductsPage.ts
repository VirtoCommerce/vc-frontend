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
import { getPropertiesGroupedByName, getPropertyValue, Logger } from "@/core/utilities";
import {
  ENABLED_KEY as CUSTOMER_REVIEWS_ENABLED_KEY,
  MODULE_ID as CUSTOMER_REVIEWS_MODULE_ID,
} from "@/modules/customer-reviews/constants";
import { useProducts } from "@/shared/catalog/composables/useProducts";
import {
  AVAILABILITY_ROW_KEY,
  CONFIG_PROPERTY_ROW_KEY_PREFIX,
  MIN_ORDER_QTY_ROW_KEY,
  PRICE_ROW_KEY,
  PROPERTY_ROW_KEY_PREFIX,
  RATING_ROW_KEY,
  SKU_ROW_KEY,
} from "../constants";
import { getDisplayPrice, getProductCategoryLabel } from "../utilities";
import { useCompareProducts } from "./useCompareProducts";
import type { ICompareCategoryTab, ICompareDisplayProduct, ICompareProductEntry, ICompareTableRow } from "../types";
import type { CreateConfiguredLineItemMutation, MoneyType, Product } from "@/core/api/graphql/types";

const EMPTY_VALUE_PLACEHOLDER = "–";

type ConfiguredLineItemType = CreateConfiguredLineItemMutation["createConfiguredLineItem"];

function getProductPropertyValue(product: Product, propertyName: string): string {
  // Reuses getPropertiesGroupedByName so hidden properties are excluded and multivalue properties
  // (several Property entries sharing the same name) are merged, matching how the product page
  // itself displays properties.
  const property = Object.values(getPropertiesGroupedByName(product.properties)).find(
    (prop) => prop.name.toLowerCase() === propertyName,
  );
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

function hasAnyValue(values: string[]): boolean {
  return values.some((value) => value !== EMPTY_VALUE_PLACEHOLDER);
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
  // preserveProductsWhileFetching: without it, useProducts.fetchProducts clears its results to
  // empty at the start of every call, including the refetch the productIds watch below triggers
  // on every add/remove — categoryTabs and selectedCategoryProducts would flash empty on every
  // edit (not just first load), which in turn resets CompareTable's own All/Differences
  // selection, since it reacts to a (transiently) too-small product count.
  const {
    fetchProducts,
    products: fetchedProducts,
    fetchingProducts,
  } = useProducts({
    preserveProductsWhileFetching: true,
  });
  const { isEnabled } = useModuleSettings(CUSTOMER_REVIEWS_MODULE_ID);
  const customerRatingEnabled = isEnabled(CUSTOMER_REVIEWS_ENABLED_KEY);
  const { mutate: createConfiguredLineItemMutation } = useMutation(CreateConfiguredLineItemDocument);
  const { storeId, currencyCode, cultureName } = globals;
  const { analytics } = useAnalytics();

  const productIds = computed(() => Array.from(new Set(products.value.map((entry) => entry.productId))));

  const configuredEntries = computed(() =>
    products.value.filter((entry) => entry.localId && entry.configurationSectionInput?.length),
  );

  const configuredLineItemsByLocalId = shallowRef<Record<string, ConfiguredLineItemType>>({});

  watch(
    configuredEntries,
    async (entries, _prevEntries, onCleanup) => {
      if (!entries.length) {
        configuredLineItemsByLocalId.value = {};
        return;
      }

      let cancelled = false;
      onCleanup(() => {
        cancelled = true;
      });

      const results = await Promise.allSettled(
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

      if (cancelled) {
        return;
      }

      const nextConfiguredLineItems: Record<string, ConfiguredLineItemType> = {};
      entries.forEach((entry, index) => {
        const result = results[index];

        if (result.status === "fulfilled") {
          if (entry.localId) {
            nextConfiguredLineItems[entry.localId] = result.value?.data?.createConfiguredLineItem;
          }
        } else {
          Logger.error("useCompareProductsPage.fetchConfiguredLineItems", result.reason);
        }
      });
      configuredLineItemsByLocalId.value = nextConfiguredLineItems;
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

    function makeRow(
      key: string,
      label: string,
      kind: ICompareTableRow["kind"],
      values: string[],
      description?: string,
    ): ICompareTableRow {
      return { key, label, kind, values, differs: new Set(values).size > 1, description };
    }

    const rows: ICompareTableRow[] = [
      makeRow(
        PRICE_ROW_KEY,
        t("shared.compare.table.fields.price_per_unit"),
        "price",
        items.map(({ product }) => getDisplayPrice(product).actual.formattedAmount),
        t("shared.compare.table.fields.price_per_unit_tooltip"),
      ),
    ];

    if (customerRatingEnabled && items.some(({ product }) => product.rating)) {
      rows.push(
        makeRow(
          RATING_ROW_KEY,
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
        AVAILABILITY_ROW_KEY,
        t("shared.compare.table.fields.availability"),
        "availability",
        items.map(({ product }) => getAvailabilitySignature(product)),
      ),
      makeRow(
        SKU_ROW_KEY,
        t("shared.compare.table.fields.sku"),
        "text",
        items.map(({ product }) => product.code || EMPTY_VALUE_PLACEHOLDER),
      ),
      makeRow(
        MIN_ORDER_QTY_ROW_KEY,
        t("shared.compare.table.fields.min_order_qty"),
        "text",
        items.map(({ product }) => (product.minQuantity != null ? n(product.minQuantity) : EMPTY_VALUE_PLACEHOLDER)),
        t("shared.compare.table.fields.min_order_qty_tooltip"),
      ),
    );

    return rows;
  });

  const propertyRows = computed<ICompareTableRow[]>(() => {
    const propertyNames = uniqBy(
      selectedCategoryProducts.value.flatMap(({ product }) =>
        Object.values(getPropertiesGroupedByName(product.properties)).map((prop) => ({
          name: prop.name.toLowerCase(),
          label: prop.label,
        })),
      ),
      "name",
    );

    return propertyNames
      .map(({ name, label }) => {
        const values = selectedCategoryProducts.value.map(({ product }) => getProductPropertyValue(product, name));

        return {
          key: `${PROPERTY_ROW_KEY_PREFIX}${name}`,
          label,
          kind: "text" as const,
          values,
          differs: new Set(values).size > 1,
        };
      })
      .filter((row) => hasAnyValue(row.values));
  });

  const configPropertyRows = computed<ICompareTableRow[]>(() => {
    const items = selectedCategoryProducts.value;
    const configPropertyLabels = uniqBy(
      items.flatMap(({ entry }) => entry.properties ?? []),
      "label",
    ).map((prop) => prop.label);

    return configPropertyLabels
      .map((label) => {
        const values = items.map(({ entry }) => getConfigPropertyValue(entry, label));

        return {
          key: `${CONFIG_PROPERTY_ROW_KEY_PREFIX}${label}`,
          label,
          kind: "text" as const,
          values,
          differs: new Set(values).size > 1,
        };
      })
      .filter((row) => hasAnyValue(row.values));
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

  // fetchProducts writes straight into shared state with no cancellation hook of its own, so
  // overlapping calls must be serialized here — otherwise an older, slower response can land after
  // a newer one and leave stale products displayed.
  let fetchProductsQueue = Promise.resolve();

  watch(
    productIds,
    (ids) => {
      if (!ids.length) {
        return;
      }

      fetchProductsQueue = fetchProductsQueue.then(async () => {
        try {
          // searchProducts defaults itemsPerPage/first to DEFAULT_PAGE_SIZE (16) when omitted.
          // The compare limit is per category with no overall cap, so the deduped id count can
          // exceed that — pass it explicitly or products past the 16th silently get no data.
          await fetchProducts({ productIds: ids, itemsPerPage: ids.length });
        } catch (e) {
          Logger.error("useCompareProductsPage.fetchProducts", e);
        }
      });
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
