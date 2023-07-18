<template>
  <VcInput
    v-model="quantity"
    class="w-[5.625rem] flex-none"
    :name="name"
    :readonly="readonly"
    :disabled="disabled"
    :min="minQuantity"
    :max="maxQuantity"
    :error="error"
    size="sm"
    type="number"
    pattern="\d*"
    center
    truncate
    @keydown="onKeydown"
    @keyup.enter="changeQuantity"
    @input="onQuantityChanged"
    @blur="onFocusOut"
  />
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";

interface IEmits {
  (event: "update:modelValue", value: number): void;
}

interface IProps {
  name?: string;
  minQuantity?: number;
  maxQuantity?: number;
  disabled?: boolean;
  readonly?: boolean;
  error?: boolean;
  modelValue?: number;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

let timeoutIdOfQuantityChange: number;

const quantity = ref<number | undefined>(props.modelValue);

function changeQuantity() {
  clearTimeout(timeoutIdOfQuantityChange);

  const newQuantity = Number(quantity.value);

  if (props.maxQuantity && newQuantity > props.maxQuantity) {
    quantity.value = props.modelValue;

    return;
  } else if (isNaN(newQuantity) || newQuantity < 1 || newQuantity === props.modelValue) {
    return;
  }

  emit("update:modelValue", newQuantity);
}

function onQuantityChanged(): void {
  clearTimeout(timeoutIdOfQuantityChange);
  timeoutIdOfQuantityChange = +setTimeout(changeQuantity, 900);
}

function onFocusOut() {
  const newQuantity = Number(quantity.value);

  if (isNaN(newQuantity) || newQuantity < 1) {
    quantity.value = props.modelValue;
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key.toLowerCase() === "e" || e.key === "-" || e.key === "." || e.key === ",") {
    e.preventDefault();
  }
}

watchEffect(() => {
  quantity.value = props.modelValue;
});
</script>
