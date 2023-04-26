import { toTypedSchema } from "@vee-validate/yup";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { number } from "yup";
import useCart from "./useCart";
import type { LineItemType } from "@/xapi/types";

export default function useQuantity() {
  const { t } = useI18n();
  const { cart } = useCart();

  const MIN_VALUE = 1;
  const MAX_VALUE = 999999;

  function getQuantityParams(lineItem: LineItemType, minQuantity = undefined, maxQuantity = undefined) {
    const countInCart = computed<number>(() => {
      const lineItemInCart = cart.value?.items?.find((item) => item.productId === lineItem.product?.id);
      return lineItemInCart?.quantity || 0;
    });

    const buttonOutlined = computed<boolean>(() => countInCart.value === 0);
    const buttonText = computed<string>(() =>
      countInCart.value ? t("common.buttons.update_cart") : t("common.buttons.add_to_cart")
    );

    const availabilityData = lineItem?.product?.availabilityData;

    const minQty = computed<number>(() => minQuantity || MIN_VALUE);
    const maxQty = computed<number>(() => Math.min(availabilityData?.availableQuantity, maxQuantity || MAX_VALUE));

    const disabled = computed<boolean>(
      () =>
        !(
          availabilityData?.isAvailable &&
          availabilityData?.isInStock &&
          availabilityData?.isBuyable &&
          availabilityData?.availableQuantity
        )
    );

    const rules = computed(() =>
      toTypedSchema(
        number()
          .typeError(t("shared.cart.add_to_cart.errors.enter_correct_number_message"))
          .integer()
          .positive()
          .min(minQty.value, ({ min }) => t("shared.cart.add_to_cart.errors.min", [min]))
          .max(maxQty.value, ({ max }) => t("shared.cart.add_to_cart.errors.max", [max]))
      )
    );

    return {
      disabled,
      minQty,
      maxQty,
      rules,
      buttonOutlined,
      buttonText,
    };
  }

  return {
    getQuantityParams,
  };
}
