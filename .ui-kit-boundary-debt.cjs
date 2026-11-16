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
    // Host helpers, constants and enums.
    "client-app/ui-kit/components/atoms/link/vc-link.vue",
    "client-app/ui-kit/components/molecules/file/vc-file.vue",
    "client-app/ui-kit/components/molecules/menu-item/vc-menu-item.vue",
    "client-app/ui-kit/components/organisms/add-to-cart/vc-add-to-cart.test.ts",
    "client-app/ui-kit/components/organisms/add-to-cart/vc-add-to-cart.vue",
    "client-app/ui-kit/composables/useQuantityValidationSchema.test.ts",
    "client-app/ui-kit/composables/useQuantityValidationSchema.ts",

    // Host services: theme context, notifications, Logger (vc-image also uses host helpers and constants).
    "client-app/ui-kit/components/atoms/image/vc-image.vue",
    "client-app/ui-kit/components/molecules/calendar/use-calendar-base.ts",
    "client-app/ui-kit/components/molecules/copy-text/vc-copy-text.vue",
    "client-app/ui-kit/components/molecules/variant-picker-group/vc-variant-picker-group.vue",
    "client-app/ui-kit/composables/useDateField.test.ts",
    "client-app/ui-kit/composables/useDateField.ts",
    "client-app/ui-kit/utilities/date.ts",
    "client-app/ui-kit/utilities/getLocales.ts",
    "client-app/ui-kit/utilities/icons.ts",

    // Tests that mount through the host's createWrapperFactory.
    "client-app/ui-kit/components/atoms/breadcrumbs/vc-breadcrumbs.test.ts",
    "client-app/ui-kit/components/atoms/label/vc-label.test.ts",
    "client-app/ui-kit/components/molecules/input/vc-input.test.ts",
    "client-app/ui-kit/components/molecules/line-item/vc-line-item.test.ts",
    "client-app/ui-kit/components/molecules/popover/vc-popover.test.ts",
    "client-app/ui-kit/components/molecules/select/vc-select.test.ts",
    "client-app/ui-kit/components/molecules/tab-switch/vc-tab-switch.test.ts",
    "client-app/ui-kit/components/molecules/textarea/vc-textarea.test.ts",
    "client-app/ui-kit/components/organisms/quantity-stepper/vc-quantity-stepper.test.ts",
    "client-app/ui-kit/components/organisms/stat-widget/vc-stat-widget.test.ts",
    "client-app/ui-kit/components/organisms/table/vc-table.test.ts",
    "client-app/ui-kit/components/templates/layout/vc-layout.test.ts",
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
