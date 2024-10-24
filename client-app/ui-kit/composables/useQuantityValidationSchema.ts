import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { number } from "yup";
import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import type { Ref } from "vue";
import type { NumberSchema } from "yup";

export function useQuantityValidationSchema(payload: {
  minQuantity?: Ref<number | undefined>;
  maxQuantity?: Ref<number | undefined>;
  availableQuantity?: Ref<number | undefined>;
}) {
  const { t } = useI18n();
  const { availableQuantity, minQuantity, maxQuantity } = payload;

  function minMaxTest(schema: NumberSchema, min: number, max: number): NumberSchema {
    return schema.test(
      "minMaxValue",
      t("shared.cart.add_to_cart.errors.min_max", [min, max]),
      (value) => !!value && value >= min && value <= max,
    );
  }

  function maxTest(schema: NumberSchema, max: number): NumberSchema {
    return schema.test("maxValue", t("shared.cart.add_to_cart.errors.max", [max]), (value) => !!value && value <= max);
  }

  function minTest(schema: NumberSchema, min: number): NumberSchema {
    return schema.test("minValue", t("shared.cart.add_to_cart.errors.min", [min]), (value) => !!value && value >= min);
  }

  function availableLessThenMinError(schema: NumberSchema, min: number): NumberSchema {
    return schema.test("incorrectMinValue", t("shared.cart.add_to_cart.errors.min_not_available", [min]), () => false);
  }

  const quantitySchema = computed<NumberSchema>(() =>
    number()
      .typeError(t("shared.cart.add_to_cart.errors.enter_correct_number_message"))
      .positive(t("shared.cart.add_to_cart.errors.positive_number"))
      .integer(t("shared.cart.add_to_cart.errors.integer_number"))
      .max(LINE_ITEM_QUANTITY_LIMIT, t("shared.cart.add_to_cart.errors.max", [LINE_ITEM_QUANTITY_LIMIT]))
      .withMutation((schema) => {
        if (availableQuantity?.value) {
          if (minQuantity?.value && maxQuantity?.value) {
            if (minQuantity.value > availableQuantity.value) {
              return availableLessThenMinError(schema, minQuantity.value);
            }
            return minMaxTest(schema, minQuantity.value, Math.min(availableQuantity.value, maxQuantity.value));
          }
          if (minQuantity?.value) {
            if (minQuantity.value > availableQuantity.value) {
              return availableLessThenMinError(schema, minQuantity.value);
            }
            return minMaxTest(schema, minQuantity.value, availableQuantity.value);
          }
          if (maxQuantity?.value) {
            return maxTest(schema, Math.min(availableQuantity.value, maxQuantity.value));
          }

          return maxTest(schema, availableQuantity.value);
        } else {
          if (minQuantity?.value && maxQuantity?.value) {
            return minMaxTest(schema, minQuantity?.value, maxQuantity.value);
          }
          if (minQuantity?.value) {
            return minTest(schema, minQuantity.value);
          }
          if (maxQuantity?.value) {
            return maxTest(schema, maxQuantity.value);
          }
        }

        return schema;
      }),
  );

  return {
    quantitySchema,
  };
}
