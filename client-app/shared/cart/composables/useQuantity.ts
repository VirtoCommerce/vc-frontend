import { toTypedSchema } from "@vee-validate/yup";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { number } from "yup";
import { ProductType } from "@/core/enums";
import type { MaybeRef } from "@vueuse/core";

export default function useQuantity(item: MaybeRef<any>) {
  const { t } = useI18n();

  const MIN_VALUE = 1;
  const MAX_VALUE = 999999;

  const buttonOutlined = computed<boolean>(() => !item.value.extended.countInCart);
  const buttonText = computed<string>(() => {
    return item.value.extended.countInCart ? t("common.buttons.update_cart") : t("common.buttons.add_to_cart");
  });

  const isDigital = computed<boolean>(() => item.value.product.productType === ProductType.Digital);

  const minQty = computed<number>(() => item.value.product.minQuantity || MIN_VALUE);
  const maxQty = computed<number>(() =>
    Math.min(
      item.value.product.availabilityData?.availableQuantity || MAX_VALUE,
      item.value.product.maxQuantity || MAX_VALUE
    )
  );

  const disabled = computed<boolean>(
    () =>
      !item.value.product.availabilityData?.isAvailable ||
      !item.value.product.availabilityData?.isInStock ||
      !item.value.product.availabilityData?.isBuyable ||
      (!item.value.product.availabilityData?.availableQuantity && !isDigital.value)
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

  const initialValue = computed(() => item.value.extended.countInCart || minQty.value);

  return {
    initialValue,
    disabled,
    minQty,
    maxQty,
    rules,
    buttonOutlined,
    buttonText,
  };
}
