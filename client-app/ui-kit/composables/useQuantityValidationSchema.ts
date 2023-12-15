import { computed, unref } from "vue";
import { useI18n } from "vue-i18n";
import { number } from "yup";
import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import type { MaybeRef } from "vue";
import type { NumberSchema } from "yup";

export function useQuantityValidationSchema(payload: {
  minQuantity?: MaybeRef<number>;
  maxQuantity?: MaybeRef<number>;
  availableQuantity?: MaybeRef<number>;
}) {
  const { t } = useI18n();

  function setMinMaxLimitsForSchema(
    schema: NumberSchema,
    minQuantity?: MaybeRef<number>,
    maxQuantity?: MaybeRef<number>,
  ): NumberSchema {
    if (minQuantity && maxQuantity) {
      return schema.test(
        "minMaxValue",
        t("shared.cart.add_to_cart.errors.min_max", [minQuantity, maxQuantity]),
        (value) => !!value && value >= unref(minQuantity) && value <= unref(maxQuantity),
      );
    }

    if (minQuantity) {
      return schema.min(unref(minQuantity), t("shared.cart.add_to_cart.errors.min", [minQuantity]));
    }

    if (maxQuantity) {
      return schema.max(unref(maxQuantity), t("shared.cart.add_to_cart.errors.max", [maxQuantity]));
    }

    return schema.max(LINE_ITEM_QUANTITY_LIMIT, t("shared.cart.add_to_cart.errors.max", [LINE_ITEM_QUANTITY_LIMIT]));
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
            (value) => !!value && value >= unref(payload.minQuantity!) && value <= unref(payload.availableQuantity!),
          );
        }

        if (payload.availableQuantity && payload.maxQuantity && payload.availableQuantity >= payload.maxQuantity) {
          return schema.max(unref(payload.maxQuantity), t("shared.cart.add_to_cart.errors.max", [payload.maxQuantity]));
        }

        if (payload.availableQuantity) {
          return schema.max(
            unref(payload.availableQuantity),
            t("shared.cart.add_to_cart.errors.max", [payload.availableQuantity]),
          );
        }

        if (payload.minQuantity || payload.maxQuantity) {
          return setMinMaxLimitsForSchema(schema, payload.minQuantity, payload.maxQuantity);
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
