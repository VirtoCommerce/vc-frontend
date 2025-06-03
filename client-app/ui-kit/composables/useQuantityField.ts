import { toTypedSchema } from "@vee-validate/yup";
import { useField } from "vee-validate";
import { computed, ref } from "vue";
import { useQuantityValidationSchema } from "@/ui-kit/composables/useQuantityValidationSchema";
import type { Ref } from "vue";

type ParamsType = {
  timeout?: number | undefined;
  disabled?: Ref<boolean | undefined>;
  isInStock?: Ref<boolean | undefined>;
  minQuantity?: Ref<number | undefined>;
  maxQuantity?: Ref<number | undefined>;
  availableQuantity?: Ref<number | undefined>;
  isActive?: Ref<boolean | undefined>;
  isAvailable?: Ref<boolean | undefined>;
  isBuyable?: Ref<boolean | undefined>;
  packSize?: Ref<number | undefined>;
  countInCart?: Ref<number | undefined>;
  modelValue: Ref<number | undefined>;
  allowZero?: Ref<boolean | undefined>;
};

export function useQuantityField(params: ParamsType) {
  const isValid = ref(true);

  const { quantitySchema } = useQuantityValidationSchema({
    minQuantity: params.minQuantity,
    maxQuantity: params.maxQuantity,
    availableQuantity: params.availableQuantity,
    packSize: params.packSize,
    allowZero: params.allowZero,
  });

  const rules = computed(() => toTypedSchema(quantitySchema.value));

  const isDisabled = computed(() => {
    return (
      params.disabled?.value === true ||
      !params.isAvailable?.value ||
      !params.isBuyable?.value ||
      !params.isInStock?.value ||
      !params.isActive?.value
    );
  });

  const { errorMessage, validate, setValue } = useField("quantity", rules, {
    initialValue: params.modelValue.value,
  });

  async function validateFields(): Promise<void> {
    if (!isDisabled.value) {
      setValue(params.modelValue.value);
      const { valid } = await validate();
      isValid.value = valid;
    } else {
      isValid.value = true;
    }
  }

  return {
    validateFields,

    isDisabled,
    isValid,
    errorMessage,
  };
}
