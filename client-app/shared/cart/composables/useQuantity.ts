import { toTypedSchema } from "@vee-validate/yup";
import { computed, unref } from "vue";
import { useI18n } from "vue-i18n";
import { number } from "yup";
import { ProductType } from "@/core/enums";
import type { MaybeRef } from "@vueuse/core";

export default function useQuantity(lineItem: MaybeRef<any>) {
  const { t } = useI18n();

  const MIN_VALUE = 1;
  const MAX_VALUE = 999999;

  const item = unref(lineItem);

  const buttonOutlined = computed<boolean>(() => item.extended.countInCart === 0);
  const buttonText = computed<string>(() =>
    item.extended.countInCart ? t("common.buttons.update_cart") : t("common.buttons.add_to_cart")
  );

  const isDigital = computed<boolean>(() => item?.product.productType === ProductType.Digital);

  const minQty = computed<number>(() => item.product.minQuantity || MIN_VALUE);
  const maxQty = computed<number>(() =>
    Math.min(item.product.availabilityData?.availableQuantity || MAX_VALUE, item.product.maxQuantity || MAX_VALUE)
  );

  const disabled = computed<boolean>(
    () =>
      !item.product.availabilityData?.isAvailable ||
      !item.product.availabilityData?.isInStock ||
      !item.product.availabilityData?.isBuyable ||
      (!item.product.availabilityData?.availableQuantity && !isDigital.value)
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
