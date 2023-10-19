import { useI18n } from "vue-i18n";
import type { NumberSchema } from "yup";

function mutateQuantityFieldSchema(schema: NumberSchema, minQuantity?: number, maxQuantity?: number): NumberSchema {
  const { t } = useI18n();

  if (minQuantity && maxQuantity) {
    console.log(123);
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
}

export function useFieldValidationSchema() {
  return {
    mutateQuantityFieldSchema,
  };
}
