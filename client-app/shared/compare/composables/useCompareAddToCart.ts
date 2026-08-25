import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useErrorsTranslator } from "@/core/composables";
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

/**
 * "Add to cart" for the compare table's plain (non-configurable, non-variation) products — no
 * stepper, just a button — but still respecting availability/minimum-order-quantity, with
 * per-entry loading state so adding one product doesn't disable the whole table.
 */
export function useCompareAddToCart() {
  const { t } = useI18n();
  const { translate } = useErrorsTranslator<ValidationErrorType>("validation_error");
  const { addToCart } = useShortCart();
  const notifications = useNotifications();

  const addingProductKeys = ref(new Set<string>());

  function isAddingToCart(item: ICompareDisplayProduct): boolean {
    return addingProductKeys.value.has(getProductKey(item));
  }

  function isAddToCartDisabled(product: Product): boolean {
    const availability = product.availabilityData;

    if (!availability?.isAvailable || !availability?.isBuyable || availability?.isInStock === false) {
      return true;
    }

    const minQuantity = product.minQuantity || 1;

    return availability.availableQuantity != null && availability.availableQuantity < minQuantity;
  }

  async function onAddToCart(item: ICompareDisplayProduct) {
    const key = getProductKey(item);

    if (addingProductKeys.value.has(key)) {
      return;
    }

    addingProductKeys.value.add(key);

    try {
      const quantity = item.product.minQuantity || 1;
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
