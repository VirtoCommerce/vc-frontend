import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { number } from "yup";
import type { NumberSchema } from "yup";

export function useQuantityValidationSchema(minQuantity?: number, maxQuantity?: number) {
  const { t } = useI18n();

  const quantitySchema = computed<NumberSchema>(() =>
    number()
      .typeError(t("shared.cart.add_to_cart.errors.enter_correct_number_message"))
      .integer()
      .positive()
      .withMutation((schema) => {
        if (minQuantity && maxQuantity) {
          return schema.test(
            "minMaxValue",
            t("shared.cart.add_to_cart.errors.min_max", [minQuantity, maxQuantity]),
            (value) => !!value && value >= minQuantity && value <= maxQuantity,
          );
        }

        if (minQuantity) {
          return schema.min(minQuantity, t("shared.cart.add_to_cart.errors.min", [minQuantity]));
        }

        if (maxQuantity) {
          return schema.max(maxQuantity, t("shared.cart.add_to_cart.errors.max", [maxQuantity]));
        }

        return schema;
      }),
  );

  return {
    quantitySchema,
  };
}
