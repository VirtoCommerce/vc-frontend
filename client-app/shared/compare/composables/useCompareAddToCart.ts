import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useErrorsTranslator, useHistoricalEvents } from "@/core/composables";
import { useAnalyticsUtils } from "@/core/composables/useAnalyticsUtils";
import { ValidationErrorObjectType } from "@/core/enums";
import { truncate } from "@/core/utilities";
import { useShortCart } from "@/shared/cart/composables";
import { useNotifications } from "@/shared/notification";
import { useQuantityValidationSchema } from "@/ui-kit/composables";
import { COMPARE_NOTIFICATION_PRODUCT_NAME_MAX_LENGTH } from "../constants";
import type { ICompareDisplayProduct } from "../types";
import type { Product, ValidationErrorType } from "@/core/api/graphql/types";

function getProductKey(item: ICompareDisplayProduct): string {
  return item.entry.localId ?? item.product.id;
}

function getQuantity(product: Product): number {
  const minQuantity = product.minQuantity || 1;
  const packSize = product.packSize;

  return packSize ? Math.ceil(minQuantity / packSize) * packSize : minQuantity;
}

/**
 * "Add to cart" for the compare table's plain (non-configurable, non-variation) products — no
 * stepper, just a button. Quantity validity (min/max/pack-size/available) is delegated to
 * useQuantityValidationSchema, the same rules QuantityControl uses everywhere else, instead of
 * being re-implemented by hand. The isActive/isAvailable/isBuyable/isInStock gate stays separate,
 * matching how vc-add-to-cart.vue checks those outside the schema too. Plus per-entry loading
 * state so adding one product doesn't disable the whole table.
 */
export function useCompareAddToCart() {
  const { t } = useI18n();
  const { translate } = useErrorsTranslator<ValidationErrorType>("validation_error");
  const { addToCart } = useShortCart();
  const notifications = useNotifications();
  const { trackAddItemToCart } = useAnalyticsUtils();
  const { pushHistoricalEvent } = useHistoricalEvents();

  const addingProductKeys = ref(new Set<string>());

  // A single reactive schema instance, re-pointed at whichever product isAddToCartDisabled is
  // currently checking — useQuantityValidationSchema needs refs (it's meant for one product's
  // live form state), but compare has many products and no per-product form, so the refs here
  // are just scratch state mutated synchronously right before quantitySchema.value is read.
  const minQuantityRef = ref<number>();
  const maxQuantityRef = ref<number>();
  const availableQuantityRef = ref<number>();
  const packSizeRef = ref<number>();

  const { quantitySchema } = useQuantityValidationSchema({
    minQuantity: minQuantityRef,
    maxQuantity: maxQuantityRef,
    availableQuantity: availableQuantityRef,
    packSize: packSizeRef,
  });

  function isAddToCartDisabled(product: Product): boolean {
    const availability = product.availabilityData;

    if (!availability?.isActive || !availability?.isAvailable || !availability?.isBuyable || !availability?.isInStock) {
      return true;
    }

    minQuantityRef.value = product.minQuantity ?? undefined;
    maxQuantityRef.value = product.maxQuantity ?? undefined;
    availableQuantityRef.value = availability.availableQuantity ?? undefined;
    packSizeRef.value = product.packSize ?? undefined;

    return !quantitySchema.value.isValidSync(getQuantity(product));
  }

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
