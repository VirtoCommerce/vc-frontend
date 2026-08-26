// How many category breadcrumb levels (from the root) are used to group products for compare.
export const COMPARE_CATEGORY_DEPTH = 2;

// Product names get truncated to this length in compare-related notifications.
export const COMPARE_NOTIFICATION_PRODUCT_NAME_MAX_LENGTH = 60;

// Compare table row keys are built by useCompareProductsPage from three different sources
// (built-in fields, catalog properties, configuration properties). Each source gets its own
// prefix so a catalog/configuration property can never collide with a built-in field's key
// (e.g. a property literally named "price" or "sku"), which would otherwise shadow/duplicate a
// row in compare-table.vue.
export const CUSTOM_FIELD_ROW_KEY_PREFIX = "field:";
export const PROPERTY_ROW_KEY_PREFIX = "property:";
export const CONFIG_PROPERTY_ROW_KEY_PREFIX = "config:";

// Keys of the rows that must always stay visible in compare-table.vue, even when the
// "Differences" filter is on. Shared between useCompareProductsPage (which creates the rows)
// and compare-table.vue (which reads this list), so the two can't drift apart.
export const PRICE_ROW_KEY = `${CUSTOM_FIELD_ROW_KEY_PREFIX}price`;
export const AVAILABILITY_ROW_KEY = `${CUSTOM_FIELD_ROW_KEY_PREFIX}availability`;

// The rest of useCompareProductsPage's built-in field rows.
export const RATING_ROW_KEY = `${CUSTOM_FIELD_ROW_KEY_PREFIX}rating`;
export const SKU_ROW_KEY = `${CUSTOM_FIELD_ROW_KEY_PREFIX}sku`;
export const MIN_ORDER_QTY_ROW_KEY = `${CUSTOM_FIELD_ROW_KEY_PREFIX}minOrderQty`;
