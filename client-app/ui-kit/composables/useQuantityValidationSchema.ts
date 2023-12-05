import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { number } from "yup";
import type { NumberSchema } from "yup";

export function useQuantityValidationSchema(payload: {
  minQuantity?: number;
  maxQuantity?: number;
  availableQuantity?: number;
}) {
  const maxLimit = 999999;

  const { t } = useI18n();

  const quantitySchema = computed<NumberSchema>(() =>
    number()
      .typeError(t("shared.cart.add_to_cart.errors.enter_correct_number_message"))
      .integer()
      .positive()
      .max(maxLimit, t("shared.cart.add_to_cart.errors.max", [maxLimit]))
      .withMutation((schema) => {
        if (payload.availableQuantity && payload.minQuantity && payload.availableQuantity < payload.minQuantity) {
          return schema.min(
            payload.minQuantity,
            t("shared.cart.add_to_cart.errors.min_not_available", [payload.minQuantity]),
          );
        }

        if (payload.minQuantity && payload.maxQuantity) {
          return schema.test(
            "minMaxValue",
            t("shared.cart.add_to_cart.errors.min_max", [payload.minQuantity, payload.maxQuantity]),
            (value) => !!value && value >= payload.minQuantity! && value <= payload.maxQuantity!,
          );
        }

        if (payload.minQuantity) {
          return schema.min(payload.minQuantity, t("shared.cart.add_to_cart.errors.min", [payload.minQuantity]));
        }

        if (payload.maxQuantity) {
          return schema.max(payload.maxQuantity, t("shared.cart.add_to_cart.errors.max", [payload.maxQuantity]));
        }

        return schema;
      }),
  );

  return {
    quantitySchema,
  };
}
