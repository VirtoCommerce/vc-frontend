import { toTypedSchema } from "@vee-validate/yup";
// import { debounce } from "lodash";
import { useField } from "vee-validate";
import { computed, ref } from "vue";
// import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import { useQuantityValidationSchema } from "@/ui-kit/composables/useQuantityValidationSchema";
import type { Ref } from "vue";

type UseQuantityValidationParams = {
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

export function useQuantityField(params: UseQuantityValidationParams) {
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

  // const handleChange = debounce(async () => {
  //   setValue(quantity.value);

  //   const newQuantity = Number(quantity.value);

  //   if (
  //     isNaN(newQuantity) ||
  //     newQuantity < 1 ||
  //     newQuantity === params.modelValue ||
  //     pendingQuantity.value === newQuantity
  //   ) {
  //     return;
  //   }

  //   await validateFields();

  //   pendingQuantity.value = newQuantity;
  // }, params.timeout ?? 0);

  // function onChange() {
  //   if (quantity.value && quantity.value > LINE_ITEM_QUANTITY_LIMIT) {
  //     quantity.value = Number(quantity.value.toString().slice(0, -1));
  //   }
  //   void handleChange();
  // }

  // function onFocusOut() {
  //   const newQuantity = Number(quantity.value);

  //   if (isNaN(newQuantity) || newQuantity < 1) {
  //     quantity.value = unref(params.modelValue);
  //   }
  // }

  // watchEffect(() => {
  //   quantity.value = unref(params.modelValue);
  //   pendingQuantity.value = null;
  // });

  return {
    validateFields,

    isDisabled,
    isValid,
    errorMessage,
  };
}
