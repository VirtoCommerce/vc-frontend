<template>
  <div>quantity: {{ quantity }}</div>
  <div>modelValue: {{ modelValue }}</div>
  <VcAddToCartDummy
    v-if="mode === 'add-to-cart'"
    v-model="quantity"
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
    :hide-button="hideButton"
    :readonly="readonly"
    :size="size"
    :show-empty-details="showEmptyDetails"
    :error="!isValid"
    :message="errorMessage"
    @update:cart-item-quantity="handleUpdateCartItemQuantity"
    @blur="handleBlur"
  >
    <slot />
  </VcAddToCartDummy>

  <VcQuantityStepper
    v-else-if="mode === 'quantity-stepper'"
    v-model="quantity"
    :name="name"
    :loading="loading"
    :disabled="isDisabled"
    :readonly="readonly"
    :min="minQuantity"
    :max="maxQuantity"
    :size="size"
    :show-empty-details="showEmptyDetails"
    :error="!isValid"
    :message="errorMessage"
    :step="packSize"
    @blur="handleBlur"
  >
    <slot />
  </VcQuantityStepper>
</template>

<script setup lang="ts">
import debounce from "lodash/debounce";
import { computed, nextTick, onMounted, ref, toRef, watch, watchEffect } from "vue";
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
  mode?: "add-to-cart" | "quantity-stepper";
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  mode: "add-to-cart",
  minQuantity: 1,
  maxQuantity: 1,
  packSize: 1,
  countInCart: 0,
  availableQuantity: 0,
  disabled: false,
  isActive: true,
  isAvailable: true,
  isBuyable: true,
  isInStock: true,
  hideButton: false,
  readonly: false,
  timeout: 0,
  validateOnMount: true,
  size: "sm",
  showEmptyDetails: false,
});

const timeout = toRef(props, "timeout");
const mode = toRef(props, "mode");

const value = defineModel<number>({ default: 0 });

const quantity = ref<number>(value.value || 0);
const pendingQuantity = ref<number>(0);

const allowZero = computed(() => mode.value === "quantity-stepper");

const { isDisabled, isValid, errorMessage, validateFields } = useQuantityField({
  modelValue: value,
  disabled: toRef(props, "disabled"),
  isActive: toRef(props, "isActive"),
  isAvailable: toRef(props, "isAvailable"),
  isBuyable: toRef(props, "isBuyable"),
  isInStock: toRef(props, "isInStock"),
  minQuantity: toRef(props, "minQuantity"),
  maxQuantity: toRef(props, "maxQuantity"),
  availableQuantity: toRef(props, "availableQuantity"),
  packSize: toRef(props, "packSize"),
  countInCart: toRef(props, "countInCart"),
  allowZero: allowZero,
});

function applyPreValidationModifiers() {
  if (quantity.value && quantity.value > LINE_ITEM_QUANTITY_LIMIT) {
    quantity.value = Number(quantity.value.toString().slice(0, -1));
  }
}

function handleUpdateCartItemQuantity() {
  emit("update:cartItemQuantity", quantity.value);
}

function handleBlur() {
  const newQuantity = Number(quantity.value);

  if (isNaN(newQuantity) || (!allowZero.value && newQuantity < 1)) {
    quantity.value = value.value;
  }
}

const handleChange = debounce(async () => {
  applyPreValidationModifiers();

  const newQuantity = Number(quantity.value);

  if (isNaN(newQuantity) || newQuantity === value.value) {
    return;
  }

  if (mode.value === "add-to-cart" && newQuantity < 1) {
    return;
  }

  value.value = newQuantity;

  await nextTick();
  await validateFields();

  pendingQuantity.value = newQuantity;

  if (isValid.value) {
    emit("update:cartItemQuantity", newQuantity);
  }
}, timeout.value ?? 0);

onMounted(async () => {
  if (mode.value === "quantity-stepper" && value.value === 0) {
    return;
  }

  if (props.validateOnMount) {
    await validateFields();
  }
});

watch(quantity, handleChange);

watchEffect(() => {
  if (isValid.value) {
    emit("update:validation", { isValid: true });
  } else {
    emit("update:validation", { isValid: false, errorMessage: errorMessage.value ?? "" });
  }
});
</script>
