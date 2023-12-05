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

  const quantitySchema = computed<NumberSchema>(() =>
    number()
      .typeError(t("shared.cart.add_to_cart.errors.enter_correct_number_message"))
      .integer()
      .positive()
      .withMutation((schema) => {
        if (
          payload.minQuantity &&
          payload.maxQuantity &&
          payload.availableQuantity &&
          (payload.availableQuantity < payload.minQuantity || payload.availableQuantity < payload.maxQuantity)
        ) {
          return schema.min(
            payload.minQuantity,
            t("shared.cart.add_to_cart.errors.min_not_available", [payload.minQuantity]),
          );
        }

        if (payload.availableQuantity && !payload.maxQuantity) {
          return schema.max(
            payload.availableQuantity,
            t("shared.cart.add_to_cart.errors.max", [payload.availableQuantity]),
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

        return schema.max(maxLimit, t("shared.cart.add_to_cart.errors.max", [maxLimit]));
      }),
  );

  return {
    quantitySchema,
  };
}
