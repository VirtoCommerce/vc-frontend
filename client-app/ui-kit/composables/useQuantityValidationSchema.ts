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
  packSize?: Ref<number | undefined>;
  allowZero?: Ref<boolean | undefined>;
}) {
  const { t } = useI18n();
  const { availableQuantity, minQuantity, maxQuantity, packSize, allowZero } = payload;

  function minMaxTest(schema: NumberSchema, min: number, max: number): NumberSchema {
    if (min === max) {
      return schema.test(
        "exactQtyValue",
        t("ui_kit.add_to_cart.errors.exact_qty", [min]),
        (value) => value !== undefined && value === min,
      );
    }
    return schema.test("minMaxValue", t("ui_kit.add_to_cart.errors.min_max", [min, max]), (value) => {
      if (allowZero?.value && value === 0) {
        return true;
      }

      return value !== undefined && value >= min && value <= max;
    });
  }

  function maxTest(schema: NumberSchema, max: number): NumberSchema {
    return schema.test(
      "maxValue",
      t("ui_kit.add_to_cart.errors.max", [max]),
      (value) => value !== undefined && value <= max,
    );
  }

  function minTest(schema: NumberSchema, min: number): NumberSchema {
    return schema.test(
      "minValue",
      t("ui_kit.add_to_cart.errors.min", [min]),
      (value) => value !== undefined && value >= min,
    );
  }

  function availableLessThenMinError(schema: NumberSchema, min: number): NumberSchema {
    return schema.test("incorrectMinValue", t("ui_kit.add_to_cart.errors.min_not_available", [min]), () => false);
  }

  function packSizeTest(schema: NumberSchema, size?: number): NumberSchema {
    if (!size) {
      return schema;
    }

    return schema.test(
      "divisible-by-packSize",
      t("ui_kit.add_to_cart.errors.pack_size", [size]),
      (value) => value !== undefined && value % size === 0,
    );
  }

  function withAvailableQuantityTest(schema: NumberSchema, quantity: number): NumberSchema {
    if (minQuantity?.value && maxQuantity?.value) {
      if (minQuantity.value > quantity) {
        return availableLessThenMinError(schema, minQuantity.value);
      }
      return minMaxTest(schema, minQuantity.value, Math.min(quantity, maxQuantity.value));
    }
    if (minQuantity?.value) {
      if (minQuantity.value > quantity) {
        return availableLessThenMinError(schema, minQuantity.value);
      }
      return minMaxTest(schema, minQuantity.value, quantity);
    }
    if (maxQuantity?.value) {
      return maxTest(schema, Math.min(quantity, maxQuantity.value));
    }

    return maxTest(schema, quantity);
  }

  function withoutAvailableQuantityTest(schema: NumberSchema): NumberSchema {
    if (minQuantity?.value && maxQuantity?.value) {
      return minMaxTest(schema, minQuantity?.value, maxQuantity.value);
    }
    if (minQuantity?.value) {
      return minTest(schema, minQuantity.value);
    }
    if (maxQuantity?.value) {
      return maxTest(schema, maxQuantity.value);
    }

    return schema;
  }

  const commonSchema = number()
    .typeError(t("ui_kit.add_to_cart.errors.enter_correct_number_message"))
    .integer(t("ui_kit.add_to_cart.errors.integer_number"))
    .max(LINE_ITEM_QUANTITY_LIMIT, t("ui_kit.add_to_cart.errors.max", [LINE_ITEM_QUANTITY_LIMIT]))
    .withMutation((schema) => {
      if (availableQuantity?.value) {
        return packSizeTest(withAvailableQuantityTest(schema, availableQuantity.value), packSize?.value);
      } else {
        return packSizeTest(withoutAvailableQuantityTest(schema), packSize?.value);
      }
    });

  const quantitySchema = computed<NumberSchema>(() =>
    allowZero ? commonSchema : commonSchema.positive(t("ui_kit.add_to_cart.errors.positive_number")),
  );

  return {
    quantitySchema,
  };
}
