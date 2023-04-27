<template>
  <VcInput
    v-model.number="quantity"
    :class="[
      'flex-none',
      {
        'w-[5.625rem]': !buttonText,
      },
    ]"
    :name="name"
    :readonly="readonly"
    :disabled="disabled"
    :min="minQuantity"
    :max="maxQuantity"
    :error="error"
    :message="errorMessage"
    size="sm"
    type="number"
    pattern="\d*"
    single-line-message
    select-on-click
    center
    truncate
    @keyup.enter="changeQuantity"
    @input="onQuantityChanged"
    @blur="onFocusOut"
  >
    <template v-if="!!buttonText" #append>
      <VcButton
        :is-outline="buttonOutlined"
        :is-waiting="loading"
        :is-disabled="disabled || error || readonly || buttonDisabled"
        class="!h-full w-28 !rounded-[inherit] uppercase"
        size="sm"
        @click="$emit('click:button', quantity)"
      >
        {{ buttonText }}
      </VcButton>
    </template>
  </VcInput>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";

interface IEmits {
  (event: "update:modelValue", value: number): void;
  (event: "click:button", value: number): void;
}

interface IProps {
  name?: string;
  minQuantity?: number;
  maxQuantity?: number;
  disabled?: boolean;
  readonly?: boolean;
  error?: boolean;
  errorMessage?: string;
  modelValue?: number;
  buttonText?: string;
  buttonOutlined?: boolean;
  buttonDisabled?: boolean;
  loading?: boolean;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

let timeoutIdOfQuantityChange: number;

const quantity = ref<number | undefined>(props.modelValue);

function changeQuantity() {
  clearTimeout(timeoutIdOfQuantityChange);

  const newQuantity = Number(quantity.value);

  if (isNaN(newQuantity) || newQuantity < 1) {
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

watchEffect(() => {
  quantity.value = props.modelValue;
});
</script>
