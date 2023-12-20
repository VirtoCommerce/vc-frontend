import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { number } from "yup";
import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import type { NumberSchema } from "yup";

export function useQuantityValidationSchema(payload: {
  minQuantity?: number;
  maxQuantity?: number;
  availableQuantity?: number;
}) {
  const { t } = useI18n();

  const { availableQuantity, minQuantity, maxQuantity } = payload;

  function setAvailabilityForSchema(schema: NumberSchema): NumberSchema {
    if (minQuantity && minQuantity <= availableQuantity!) {
      return schema.test(
        "minMaxValue",
        t("shared.cart.add_to_cart.errors.min_max", [minQuantity, availableQuantity!]),
        (value) => !!value && value >= minQuantity && value <= availableQuantity!,
      );
    }

    if (minQuantity && minQuantity > availableQuantity!) {
      return schema.max(
        availableQuantity!,
        t("shared.cart.add_to_cart.errors.min_not_available", [availableQuantity!]),
      );
    }

    if (maxQuantity && maxQuantity <= availableQuantity!) {
      return schema.max(maxQuantity, t("shared.cart.add_to_cart.errors.max", [maxQuantity]));
    }

    if (maxQuantity && maxQuantity > availableQuantity!) {
      return schema.max(availableQuantity!, t("shared.cart.add_to_cart.errors.max", [availableQuantity!]));
    }

    return schema.max(availableQuantity!, t("shared.cart.add_to_cart.errors.max", [availableQuantity!]));
  }

  const quantitySchema = computed<NumberSchema>(() =>
    number()
      .typeError(t("shared.cart.add_to_cart.errors.enter_correct_number_message"))
      .positive()
      .integer()
      .withMutation((schema) => {
        if (
          availableQuantity &&
          minQuantity &&
          maxQuantity &&
          availableQuantity > minQuantity &&
          availableQuantity > maxQuantity
        ) {
          return schema.test(
            "minMaxValue",
            t("shared.cart.add_to_cart.errors.min_max", [minQuantity, maxQuantity]),
            (value) => !!value && value >= minQuantity && value <= maxQuantity,
          );
        }

        if (availableQuantity) {
          return setAvailabilityForSchema(schema);
        }

        if (minQuantity && maxQuantity) {
          return schema.test(
            "minMaxValue",
            t("shared.cart.add_to_cart.errors.min_max", [minQuantity, maxQuantity]),
            (value) => !!value && value >= minQuantity && value <= maxQuantity,
          );
        }

        if (minQuantity) {
          return schema.min(minQuantity, t("shared.cart.add_to_cart.errors.max", [minQuantity]));
        }

        if (maxQuantity) {
          return schema.max(maxQuantity, t("shared.cart.add_to_cart.errors.max", [maxQuantity]));
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
