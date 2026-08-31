import { useMutation } from "@vue/apollo-composable";
import { uniqBy } from "lodash-es";
import { computed, ref, shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { CreateConfiguredLineItemDocument, PropertyValueTypes } from "@/core/api/graphql/types";
import { useAnalytics } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MAX_DISPLAY_IN_STOCK_QUANTITY } from "@/core/constants";
import { ProductType } from "@/core/enums";
import { globals } from "@/core/globals";
import { getPropertiesGroupedByName, Logger } from "@/core/utilities";
import {
  ENABLED_KEY as CUSTOMER_REVIEWS_ENABLED_KEY,
  MODULE_ID as CUSTOMER_REVIEWS_MODULE_ID,
} from "@/modules/customer-reviews/constants";
import { useProducts } from "@/shared/catalog/composables/useProducts";
import { useNotifications } from "@/shared/notification";
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
const FETCH_ERROR_NOTIFICATIONS_GROUP = "compare-products-fetch-error";

type ConfiguredLineItemType = CreateConfiguredLineItemMutation["createConfiguredLineItem"];

function getProductPropertyValue(product: Product, propertyName: string): string {
  // Reuses getPropertiesGroupedByName so hidden properties are excluded and multivalue properties
  // (several Property entries sharing the same name) are merged, matching how the product page
  // itself displays properties. getPropertiesGroupedByName already runs each property through
  // getPropertyValue internally — its .value is the final formatted text, not the raw value — so
  // it must NOT be passed through getPropertyValue a second time here: for a Boolean property that
  // second pass would read the already-formatted string ("Да"/"Нет") as the value to test for
  // truthiness, and any non-empty string is truthy, so it would always resolve to the "true" text.
  const property = Object.values(getPropertiesGroupedByName(product.properties)).find(
    (prop) => prop.name.toLowerCase() === propertyName,
  );
  return property?.value != null ? String(property.value) : EMPTY_VALUE_PLACEHOLDER;
}

// getPropertiesGroupedByName formats .value into display text ("Да"/"Нет"), losing the raw boolean —
// so boolean-kind rows (rendered as a check/x icon, see compare-table.vue) read straight off the
// product's own properties instead of going through that formatting step.
function isBooleanProperty(product: Product, propertyName: string): boolean {
  return product.properties.some(
    (prop) =>
      !prop.hidden && prop.name.toLowerCase() === propertyName && prop.propertyValueType === PropertyValueTypes.Boolean,
  );
}

function getProductPropertyBooleanValue(product: Product, propertyName: string): boolean | undefined {
  const property = product.properties.find(
    (prop) =>
      !prop.hidden && prop.name.toLowerCase() === propertyName && prop.propertyValueType === PropertyValueTypes.Boolean,
  );

  if (!property || property.value === undefined) {
    return undefined;
  }

  return property.value === true;
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

function resolveEntryProducts(entries: ICompareProductEntry[], fetchedProducts: Product[]): Product[] {
  return entries
    .map((entry) => fetchedProducts.find((product) => product.id === entry.productId))
    .filter((product): product is Product => !!product);
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
  const { products } = useCompareProducts();
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
  const notifications = useNotifications();
  const { isEnabled } = useModuleSettings(CUSTOMER_REVIEWS_MODULE_ID);
  const customerRatingEnabled = isEnabled(CUSTOMER_REVIEWS_ENABLED_KEY);
  const { mutate: createConfiguredLineItemMutation } = useMutation(CreateConfiguredLineItemDocument);
  const { storeId, currencyCode, cultureName } = globals;
  const { analytics } = useAnalytics();

  const productIds = computed(() => Array.from(new Set(products.value.map((entry) => entry.productId))));

  const configuredEntries = computed(() =>
    products.value.filter((entry) => entry.localId && entry.configurationSectionInput?.length),
  );

  // configuredEntries is a computed array — a fresh reference on every products.value change,
  // including an unrelated plain product added/removed elsewhere in the list, even though the
  // configured subset itself didn't change. Watching this string instead keeps the watcher below
  // from re-issuing a createConfiguredLineItem mutation for every configured entry on every
  // unrelated edit.
  const configuredEntriesSignature = computed(() =>
    configuredEntries.value
      .map((entry) => `${entry.localId}:${JSON.stringify(entry.configurationSectionInput)}`)
      .join("|"),
  );

  const configuredLineItemsByLocalId = shallowRef<Record<string, ConfiguredLineItemType>>({});

  watch(
    configuredEntriesSignature,
    async (_signature, _prevSignature, onCleanup) => {
      const entries = configuredEntries.value;

      if (!entries.length) {
        configuredLineItemsByLocalId.value = {};
        return;
      }

      // Only entries we don't already have a result for — the signature can also change because
      // one more configured entry was added while the rest are unchanged, and those don't need
      // re-fetching either.
      const entriesToFetch = entries.filter(
        (entry) => entry.localId && !(entry.localId in configuredLineItemsByLocalId.value),
      );

      let cancelled = false;
      onCleanup(() => {
        cancelled = true;
      });

      const results = entriesToFetch.length
        ? await Promise.allSettled(
            entriesToFetch.map((entry) =>
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
          )
        : [];

      if (cancelled) {
        return;
      }

      const currentLocalIds = new Set(entries.map((entry) => entry.localId).filter(Boolean));
      const nextConfiguredLineItems: Record<string, ConfiguredLineItemType> = {};

      // Carry over already-fetched entries that are still present.
      Object.entries(configuredLineItemsByLocalId.value).forEach(([localId, item]) => {
        if (currentLocalIds.has(localId)) {
          nextConfiguredLineItems[localId] = item;
        }
      });

      entriesToFetch.forEach((entry, index) => {
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
    const entriesByCategoryKey = new Map<string, ICompareProductEntry[]>();

    products.value.forEach((entry) => {
      const entries = entriesByCategoryKey.get(entry.categoryKey);
      if (entries) {
        entries.push(entry);
      } else {
        entriesByCategoryKey.set(entry.categoryKey, [entry]);
      }
    });

    return Array.from(entriesByCategoryKey.entries()).map(([categoryKey, entries]) => {
      // Per entry, not just the first one — an earlier entry in the same category can still be
      // unresolved (>16 cap, deleted product, failed fetch) while a later one fetched fine.
      const resolvedProducts = resolveEntryProducts(entries, fetchedProducts.value);

      const fallbackLabelKey =
        categoryKey === "" ? "shared.compare.table.uncategorized" : "shared.compare.table.unresolved_category";
      const label =
        categoryKey !== "" && resolvedProducts[0] ? getProductCategoryLabel(resolvedProducts[0]) : t(fallbackLabelKey);

      return {
        categoryKey,
        label,
        // Resolved entries only, so this always matches what actually renders below — raw
        // storage count (getCategoryProductsCount) stays available separately for anything
        // that needs "how many will actually be removed" (e.g. Clear category).
        count: resolvedProducts.length,
      };
    });
  });

  // Seeded from ?category= when arriving via the "added to compare" toast's button (see
  // addToCompareList in useCompareProducts.ts), so it opens straight into that product's
  // category instead of whichever one would otherwise be picked by default.
  const initialCategoryKey = typeof route.query.category === "string" ? route.query.category : "";
  const selectedCategoryKey = ref(initialCategoryKey);
  // Whether selectedCategoryKey reflects a deliberate choice (deep link or tab click) rather than
  // the tabs watch below picking a default for the user. Only a still-automatic selection gets
  // moved once counts resolve — a deliberate one is never overridden, even if its count is 0.
  const isCategorySelectionDeliberate = ref(initialCategoryKey !== "");

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
        const items = selectedCategoryProducts.value;
        const values = items.map(({ product }) => getProductPropertyValue(product, name));
        const isBoolean = items.some(({ product }) => isBooleanProperty(product, name));

        return {
          key: `${PROPERTY_ROW_KEY_PREFIX}${name}`,
          label,
          kind: isBoolean ? ("boolean" as const) : ("text" as const),
          values,
          differs: new Set(values).size > 1,
          boolValues: isBoolean ? items.map(({ product }) => getProductPropertyBooleanValue(product, name)) : undefined,
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

  // selectedCategoryProducts also recomputes (new array reference) once configuredLineItemsByLocalId
  // resolves the price override for an already-shown set, which would otherwise re-fire this watch
  // for the exact same items. Only actually send viewItemList when the shown set itself changes.
  let lastViewedItemListSignature: string | null = null;

  watch(
    selectedCategoryProducts,
    (items) => {
      if (!items.length) {
        return;
      }

      const signature = `${selectedCategoryKey.value}:${items.map(({ entry }) => entry.localId ?? entry.productId).join(",")}`;

      if (signature === lastViewedItemListSignature) {
        return;
      }
      lastViewedItemListSignature = signature;

      analytics(
        "viewItemList",
        items.map(({ product }) => product),
        compareProductsListProperties.value,
      );
    },
    { immediate: true },
  );

  function selectCategory(categoryKey: string) {
    isCategorySelectionDeliberate.value = true;
    selectedCategoryKey.value = categoryKey;
  }

  watch(
    categoryTabs,
    (tabs) => {
      if (!tabs.length) {
        return;
      }

      const currentTab = tabs.find((tab) => tab.categoryKey === selectedCategoryKey.value);

      // A deliberate selection (deep link or tab click) is never moved, even at count 0 — that's
      // what lets Clear category reach an unresolved entry. Only an automatic default gets
      // upgraded to a populated tab once one resolves; missing entirely always needs a re-pick.
      if (currentTab && (isCategorySelectionDeliberate.value || currentTab.count > 0)) {
        return;
      }

      selectedCategoryKey.value = tabs.find((tab) => tab.count > 0)?.categoryKey ?? tabs[0].categoryKey;
    },
    { immediate: true },
  );

  // fetchProducts writes straight into shared state with no cancellation hook of its own, so
  // overlapping calls must be serialized here — otherwise an older, slower response can land after
  // a newer one and leave stale products displayed.
  let fetchProductsQueue = Promise.resolve();
  const fetchFailed = ref(false);

  function fetchCompareProducts(ids: string[]) {
    if (!ids.length) {
      return;
    }

    fetchProductsQueue = fetchProductsQueue.then(async () => {
      try {
        // searchProducts defaults itemsPerPage/first to DEFAULT_PAGE_SIZE (16) when omitted.
        // The compare limit is per category with no overall cap, so the deduped id count can
        // exceed that — pass it explicitly or products past the 16th silently get no data.
        await fetchProducts({ productIds: ids, itemsPerPage: ids.length });
        fetchFailed.value = false;
      } catch (e) {
        Logger.error("useCompareProductsPage.fetchProducts", e);
        fetchFailed.value = true;
        notifications.warning({
          duration: 15000,
          group: FETCH_ERROR_NOTIFICATIONS_GROUP,
          singleInGroup: true,
          text: t("shared.compare.notifications.fetch_failed"),
        });
      }
    });
  }

  watch(productIds, fetchCompareProducts, { immediate: true });

  function retryFetch() {
    fetchCompareProducts(productIds.value);
  }

  return {
    categoryTabs,
    selectedCategoryKey,
    selectedCategoryLabel,
    selectedCategoryCount,
    selectedCategoryProducts,
    tableRows,
    differRowsCount,
    fetchingProducts,
    fetchFailed,
    retryFetch,
    selectCategory,
    selectItemEvent,
  };
}
