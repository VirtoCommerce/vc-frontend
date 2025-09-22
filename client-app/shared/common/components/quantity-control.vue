<template>
  <VcAddToCart
    v-if="mode === 'button'"
    :model-value="modelValue"
    :name="name"
    :loading="loading"
    :disabled="disabled"
    :min-quantity="minQuantity"
    :max-quantity="maxQuantity"
    :pack-size="packSize"
    :count-in-cart="countInCart"
    :available-quantity="availableQuantity"
    :is-active="isActive"
    :is-available="isAvailable"
    :is-buyable="isBuyable"
    :is-in-stock="isInStock"
    :error="error"
    :hide-button="hideButton"
    :readonly="readonly"
    :size="size"
    :show-empty-details="showEmptyDetails"
    :message="message"
    :validate-on-mount="validateOnMount"
    data-test-id="add-to-cart-component"
    @update:cart-item-quantity="emit('update:cartItemQuantity', $event)"
    @update:validation="emit('update:validation', $event)"
    @update:model-value="value = $event"
  >
    <slot />
  </VcAddToCart>

  <VcQuantityStepper
    v-else-if="mode === 'stepper'"
    v-model="stepperQuantity"
    :name="name"
    :loading="loading"
    :disabled="isDisabled"
    :readonly="readonly"
    :min="minQuantity"
    :max="
      availableQuantity && maxQuantity
        ? Math.min(maxQuantity, availableQuantity)
        : availableQuantity
          ? availableQuantity
          : maxQuantity
    "
    :size="size"
    :show-empty-details="showEmptyDetails"
    :error="!isValid"
    :message="errorMessage"
    :step="packSize"
    :allow-zero="allowZero"
  >
    <slot />
  </VcQuantityStepper>
</template>

<script setup lang="ts">
import debounce from "lodash/debounce";
import { computed, nextTick, onMounted, ref, toRefs, watch, watchEffect } from "vue";
import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants/line-items";
import { useQuantityField } from "@/ui-kit/composables/useQuantityField";

interface IEmits {
  "update:cartItemQuantity": [quantity: number];
  "update:validation": [value: { isValid: true } | { isValid: false; errorMessage: string }];
}

interface IProps {
  name?: string;
  modelValue?: number;
  loading?: boolean;
  disabled?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
  packSize?: number;
  countInCart?: number;
  availableQuantity?: number;
  isActive?: boolean;
  isAvailable?: boolean;
  isBuyable?: boolean;
  isInStock?: boolean;
  message?: string;
  showEmptyDetails?: boolean;
  error?: boolean;
  hideButton?: boolean;
  readonly?: boolean;
  timeout?: number;
  validateOnMount?: boolean;
  size?: "sm" | "md";
  mode?: "button" | "stepper";
  allowZero?: boolean;
  emitUpdateOnStepperChange?: boolean;
  disableValidation?: boolean;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  mode: "button",
  disabled: false,
  isActive: true,
  isAvailable: true,
  isBuyable: true,
  isInStock: true,
  hideButton: false,
  readonly: false,
  timeout: 0,
  size: "sm",
  showEmptyDetails: false,
  allowZero: false,
  emitUpdateOnStepperChange: true,
});

const {
  timeout,
  mode,
  allowZero,
  disabled,
  isActive,
  isAvailable,
  isBuyable,
  isInStock,
  minQuantity,
  maxQuantity,
  availableQuantity,
  packSize,
  countInCart,
  emitUpdateOnStepperChange,
  validateOnMount,
  disableValidation,
} = toRefs(props);

const value = defineModel<number>({ default: 0 });

const stepperQuantity = ref<number>(value.value || 0);

const { isDisabled, isValid, errorMessage, validateFields } = useQuantityField({
  modelValue: value,
  disabled,
  isActive,
  isAvailable,
  isBuyable,
  isInStock,
  minQuantity,
  maxQuantity,
  availableQuantity,
  packSize,
  countInCart,
  allowZero: computed(() => mode.value === "stepper" && allowZero.value),
});

function applyStepperPreValidationModifiers() {
  if (stepperQuantity.value && stepperQuantity.value > LINE_ITEM_QUANTITY_LIMIT) {
    stepperQuantity.value = Number(stepperQuantity.value.toString().slice(0, -1));
  }
}

const handleStepperChange = debounce(async () => {
  const newQuantity = Number(stepperQuantity.value);

  if (isNaN(newQuantity) || newQuantity === value.value) {
    return;
  }

  if (mode.value === "button" && newQuantity < 1 && !allowZero.value) {
    return;
  }

  value.value = newQuantity;

  await nextTick();
  if (!disableValidation.value) {
    await validateFields();
  }

  if (isValid.value && mode.value === "stepper" && emitUpdateOnStepperChange.value) {
    emit("update:cartItemQuantity", newQuantity);
  }
}, timeout.value ?? 0);

onMounted(async () => {
  if (mode.value === "stepper" && value.value === 0) {
    return;
  }

  if (validateOnMount.value && !disableValidation.value) {
    await validateFields();
  }
});

watch(stepperQuantity, () => {
  applyStepperPreValidationModifiers();
  void handleStepperChange();
});

watch(value, () => {
  stepperQuantity.value = value.value;
  applyStepperPreValidationModifiers();
});

watchEffect(() => {
  if (isValid.value) {
    emit("update:validation", { isValid: true });
  } else {
    emit("update:validation", { isValid: false, errorMessage: errorMessage.value ?? "" });
  }
});
</script>
