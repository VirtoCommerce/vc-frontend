import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useErrorsTranslator, useHistoricalEvents } from "@/core/composables";
import { useAnalyticsUtils } from "@/core/composables/useAnalyticsUtils";
import { ValidationErrorObjectType } from "@/core/enums";
import { truncate } from "@/core/utilities";
import { useShortCart } from "@/shared/cart/composables";
import { useNotifications } from "@/shared/notification";
import { COMPARE_NOTIFICATION_PRODUCT_NAME_MAX_LENGTH } from "../constants";
import type { ICompareDisplayProduct } from "../types";
import type { Product, ValidationErrorType } from "@/core/api/graphql/types";

function getProductKey(item: ICompareDisplayProduct): string {
  return item.entry.localId ?? item.product.id;
}

// Fixed quantity this button adds — the smallest orderable amount, same as the first "+" click
// on the shared stepper would land on (see minAligned in ui-kit/utilities/quantity-stepper.ts):
// minQuantity rounded UP to the nearest packSize multiple, never a non-pack-aligned amount.
function getQuantity(product: Product): number {
  const minQuantity = product.minQuantity || 1;
  const packSize = product.packSize;

  return packSize ? Math.ceil(minQuantity / packSize) * packSize : minQuantity;
}

function isAddToCartDisabled(product: Product): boolean {
  const availability = product.availabilityData;

  if (!availability?.isActive || !availability?.isAvailable || !availability?.isBuyable || !availability?.isInStock) {
    return true;
  }

  const quantity = getQuantity(product);

  if (availability.availableQuantity != null && availability.availableQuantity < quantity) {
    return true;
  }

  return !!product.maxQuantity && quantity > product.maxQuantity;
}

/**
 * "Add to cart" for the compare table's plain (non-configurable, non-variation) products — no
 * stepper, just a button — but still respecting availability/minimum-order-quantity/pack-size/
 * max-quantity the same way the shared QuantityControl validation would (see
 * useQuantityValidationSchema), with per-entry loading state so adding one product doesn't
 * disable the whole table.
 */
export function useCompareAddToCart() {
  const { t } = useI18n();
  const { translate } = useErrorsTranslator<ValidationErrorType>("validation_error");
  const { addToCart } = useShortCart();
  const notifications = useNotifications();
  const { trackAddItemToCart } = useAnalyticsUtils();
  const { pushHistoricalEvent } = useHistoricalEvents();

  const addingProductKeys = ref(new Set<string>());

  function isAddingToCart(item: ICompareDisplayProduct): boolean {
    return addingProductKeys.value.has(getProductKey(item));
  }

  async function onAddToCart(item: ICompareDisplayProduct) {
    const key = getProductKey(item);

    if (addingProductKeys.value.has(key)) {
      return;
    }

    addingProductKeys.value.add(key);

    try {
      const quantity = getQuantity(item.product);
      const updatedCart = await addToCart(item.product.id, quantity);
      const validationMessages =
        updatedCart?.validationErrors
          ?.filter(
            (error) =>
              error.objectId === item.product.id && error.objectType === ValidationErrorObjectType.CatalogProduct,
          )
          .map(translate)
          .filter(Boolean) ?? [];

      if (!updatedCart || validationMessages.length) {
        notifications.error({
          text: t("common.messages.fail_add_product_to_cart", { reason: validationMessages.join(" ") }),
          duration: 4000,
        });
      } else {
        trackAddItemToCart(item.product, quantity, { source_block: "compare" });
        void pushHistoricalEvent({ eventType: "addToCart", productId: item.product.id });

        notifications.success({
          html: t("shared.compare.notifications.added_to_cart_html", {
            productName: truncate(item.product.name, COMPARE_NOTIFICATION_PRODUCT_NAME_MAX_LENGTH),
          }),
          duration: 4000,
        });
      }
    } finally {
      addingProductKeys.value.delete(key);
    }
  }

  return {
    isAddingToCart,
    isAddToCartDisabled,
    onAddToCart,
  };
}
