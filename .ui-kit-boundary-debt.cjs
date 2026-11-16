/**
 * Files that break the ui-kit import boundary today. ui-kit is becoming a separate package, so it must not
 * import the rest of client-app, and the rest of client-app must reach it only through its public entries.
 *
 * Read by .dependency-cruiser.cjs (both rules) and eslint.config.js (the ui-kit → host rule, where
 * `import type` is visible). Known debt: delete a line once its file is fixed, never add one.
 */
module.exports = {
  // ui-kit files that import from the rest of client-app.
  uiKitToHost: [
    // Host services: theme context, notifications, Logger.
    "client-app/ui-kit/components/atoms/image/vc-image.vue",
    "client-app/ui-kit/components/molecules/calendar/use-calendar-base.ts",
    "client-app/ui-kit/components/molecules/copy-text/vc-copy-text.vue",
    "client-app/ui-kit/components/molecules/variant-picker-group/vc-variant-picker-group.vue",
    "client-app/ui-kit/composables/useDateField.test.ts",
    "client-app/ui-kit/composables/useDateField.ts",
    "client-app/ui-kit/utilities/date.ts",
    "client-app/ui-kit/utilities/getLocales.ts",
    "client-app/ui-kit/utilities/icons.ts",
  ],

  // Files outside ui-kit that import a ui-kit file past its public entries.
  hostToUiKitInternals: [
    "client-app/app-runner.ts",
    "client-app/core-api/index.ts",
    "client-app/modules/purchase-requests/composables/usePurchaseRequest.ts",
    "client-app/shared/account/components/date-filter-select.vue",
    "client-app/shared/catalog/components/price.vue",
    "client-app/shared/catalog/components/product-price.vue",
    "client-app/shared/catalog/composables/useProductVariationProperties.ts",
    "client-app/shared/checkout/components/select-address-map/select-address-map-desktop.vue",
    "client-app/shared/checkout/components/select-address-map/select-address-map-mobile.vue",
    "client-app/shared/checkout/components/select-address-map/select-address-map-view.vue",
    "client-app/shared/common/components/quantity-control.vue",
  ],
};
