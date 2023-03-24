<template>
  <VcInput
    v-model="quantity"
    class="w-[5.625rem] flex-none"
    :name="item.id"
    :readonly="readonly"
    :disabled="disabled"
    :min="item.minQuantity"
    :max="item.maxQuantity"
    :error="error"
    size="sm"
    type="number"
    pattern="\d*"
    centered
    truncate
    @keyup.enter="changeQuantity"
    @input="onQuantityChanged"
    @blur="onFocusOut"
  />
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import type { PreparedLineItemType } from "@/core/types";

interface IEmits {
  (event: "change", quantity: number): void;
}

interface IProps {
  disabled?: boolean;
  readonly?: boolean;
  error?: boolean;
  item: PreparedLineItemType;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

let timeoutIdOfQuantityChange: number;

const quantity = ref<number | undefined>(props.item.quantity);

function changeQuantity() {
  clearTimeout(timeoutIdOfQuantityChange);

  const newQuantity = Number(quantity.value);

  if (isNaN(newQuantity) || newQuantity < 1 || newQuantity === props.item.quantity) {
    return;
  }

  emit("change", newQuantity);
}

function onQuantityChanged(): void {
  clearTimeout(timeoutIdOfQuantityChange);
  timeoutIdOfQuantityChange = +setTimeout(changeQuantity, 900);
}

function onFocusOut() {
  const newQuantity = Number(quantity.value);

  if (isNaN(newQuantity) || newQuantity < 1) {
    quantity.value = props.item.quantity;
  }
}

watchEffect(() => {
  quantity.value = props.item.quantity;
});
</script>
