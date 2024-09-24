import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { number } from "yup";
import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import type { Ref } from "vue";
import type { NumberSchema } from "yup";

export function useQuantityValidationSchema(payload: {
  positive?: Ref<boolean | undefined>;
  isInStock?: Ref<boolean | undefined>;
  minQuantity?: Ref<number | undefined>;
  maxQuantity?: Ref<number | undefined>;
  availableQuantity?: Ref<number | undefined>;
}) {
  const { t } = useI18n();

  const { positive, isInStock, availableQuantity, minQuantity, maxQuantity } = payload;

  function setAvailabilityForSchema(schema: NumberSchema): NumberSchema {
    if (availableQuantity?.value && minQuantity?.value && minQuantity.value < availableQuantity.value) {
      return schema.test(
        "minMaxValue",
        t("shared.cart.add_to_cart.errors.min_max", [minQuantity.value, availableQuantity.value]),
        (value) => !!value && value >= minQuantity.value! && value <= availableQuantity.value!,
      );
    }

    if (availableQuantity?.value && minQuantity?.value && minQuantity.value > availableQuantity.value) {
      return schema.test(
        "incorrectMinValue",
        t("shared.cart.add_to_cart.errors.min_not_available", [minQuantity.value]),
        () => false,
      );
    }

    if (availableQuantity?.value && minQuantity?.value && minQuantity.value === availableQuantity.value) {
      return schema.test(
        "minValueEqualsAvailableQty",
        t("shared.cart.add_to_cart.errors.min", [minQuantity.value]),
        (value) => !!value && value >= minQuantity.value! && value <= availableQuantity.value!,
      );
    }

    if (availableQuantity?.value && maxQuantity?.value && maxQuantity.value <= availableQuantity.value) {
      return schema.max(maxQuantity.value, t("shared.cart.add_to_cart.errors.max", [maxQuantity.value]));
    }

    if (availableQuantity?.value && maxQuantity?.value && maxQuantity.value > availableQuantity.value) {
      return schema.max(availableQuantity.value, t("shared.cart.add_to_cart.errors.max", [availableQuantity.value]));
    }

    if (availableQuantity?.value) {
      return schema.max(availableQuantity.value, t("shared.cart.add_to_cart.errors.max", [availableQuantity.value]));
    }

    return schema.max(LINE_ITEM_QUANTITY_LIMIT, t("shared.cart.add_to_cart.errors.max", [LINE_ITEM_QUANTITY_LIMIT]));
  }

  const quantitySchema = computed<NumberSchema>(() =>
    (positive?.value ? number().positive() : number())
      .typeError(t("shared.cart.add_to_cart.errors.enter_correct_number_message"))
      .integer()
      .withMutation((schema) => {
        if (!isInStock?.value) {
          return schema;
        }

        if (
          availableQuantity?.value &&
          minQuantity?.value &&
          maxQuantity?.value &&
          availableQuantity.value >= minQuantity.value &&
          availableQuantity.value >= maxQuantity.value
        ) {
          return schema.test(
            "minMaxValue",
            t("shared.cart.add_to_cart.errors.min_max", [minQuantity.value, maxQuantity.value]),
            (value) => !!value && value >= minQuantity.value! && value <= maxQuantity.value!,
          );
        }

        if (availableQuantity?.value) {
          return setAvailabilityForSchema(schema);
        }

        if (minQuantity?.value && maxQuantity?.value) {
          return schema.test(
            "minMaxValue",
            t("shared.cart.add_to_cart.errors.min_max", [minQuantity.value, maxQuantity.value]),
            (value) => !!value && value >= minQuantity.value! && value <= maxQuantity.value!,
          );
        }

        if (minQuantity?.value) {
          return schema.min(minQuantity.value, t("shared.cart.add_to_cart.errors.min", [minQuantity.value]));
        }

        if (maxQuantity?.value) {
          return schema.max(maxQuantity.value, t("shared.cart.add_to_cart.errors.max", [maxQuantity.value]));
        }

        return schema.max(
          LINE_ITEM_QUANTITY_LIMIT,
          t("shared.cart.add_to_cart.errors.max", [LINE_ITEM_QUANTITY_LIMIT]),
        );
      }),
  );

  return {
    quantitySchema,
  };
}
