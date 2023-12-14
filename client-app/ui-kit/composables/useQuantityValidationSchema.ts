import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { number } from "yup";
import type { NumberSchema } from "yup";

export function useQuantityValidationSchema(payload: {
  minQuantity?: number;
  maxQuantity?: number;
  availableQuantity?: number;
}) {
  const { t } = useI18n();

  const maxLimit = 999999;

  function setMinMaxForSchema(schema: NumberSchema, minQuantity?: number, maxQuantity?: number): NumberSchema {
    if (minQuantity && maxQuantity) {
      return schema.test(
        "minMaxValue",
        t("shared.cart.add_to_cart.errors.min_max", [minQuantity, maxQuantity]),
        (value) => !!value && value >= minQuantity! && value <= maxQuantity!,
      );
    }

    if (minQuantity) {
      return schema.min(minQuantity, t("shared.cart.add_to_cart.errors.min", [minQuantity]));
    }

    if (maxQuantity) {
      return schema.max(maxQuantity, t("shared.cart.add_to_cart.errors.max", [maxQuantity]));
    }

    return schema.max(maxLimit, t("shared.cart.add_to_cart.errors.max", [maxLimit]));
  }

  const quantitySchema = computed<NumberSchema>(() =>
    number()
      .typeError(t("shared.cart.add_to_cart.errors.enter_correct_number_message"))
      .positive()
      .integer()
      .withMutation((schema) => {
        if (payload.availableQuantity && payload.minQuantity) {
          return schema.test(
            "minMaxValue",
            t("shared.cart.add_to_cart.errors.min_max", [payload.minQuantity, payload.availableQuantity]),
            (value) => !!value && value >= payload.minQuantity! && value <= payload.availableQuantity!,
          );
        }

        if (payload.availableQuantity && payload.maxQuantity && payload.availableQuantity >= payload.maxQuantity) {
          return schema.max(payload.maxQuantity, t("shared.cart.add_to_cart.errors.max", [payload.maxQuantity]));
        }

        if (payload.availableQuantity) {
          return schema.max(
            payload.availableQuantity,
            t("shared.cart.add_to_cart.errors.max", [payload.availableQuantity]),
          );
        }

        if (payload.minQuantity || payload.maxQuantity) {
          return setMinMaxForSchema(schema, payload.minQuantity, payload.maxQuantity);
        }

        return schema.max(maxLimit, t("shared.cart.add_to_cart.errors.max", [maxLimit]));
      }),
  );

  return {
    quantitySchema,
  };
}
