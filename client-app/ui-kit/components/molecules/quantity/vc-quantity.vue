<template>
  <VcInput
    v-model="quantity"
    :name="name"
    :readonly="readonly"
    :disabled="disabled"
    :error="error"
    class="w-[5.625rem] flex-none"
    size="sm"
    type="number"
    center
    truncate
    @keydown="onKeydown"
    @keyup.enter="changeQuantity"
    @input="onQuantityChanged"
    @blur="onFocusOut"
  />
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField } from "vee-validate";
import { computed, ref, watchEffect } from "vue";
import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import { useQuantityValidationSchema } from "@/ui-kit/composables";

interface IEmits {
  (event: "update:modelValue", value: number): void;
  (event: "update:validation", value: { isValid: true } | { isValid: false; errorMessage: string }): void;
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

const quantity = ref<number | undefined>();

const { quantitySchema } = useQuantityValidationSchema({});

const rules = computed(() => toTypedSchema(quantitySchema.value));

const { errorMessage, setValue, validate } = useField("quantity", rules);

function changeQuantity() {
  clearTimeout(timeoutIdOfQuantityChange);

  if (!isQuantity(quantity.value) || quantity.value === props.modelValue || quantity.value > LINE_ITEM_QUANTITY_LIMIT) {
    return;
  }

  emit("update:modelValue", quantity.value);
}

async function onQuantityChanged(): Promise<void> {
  if (!isQuantity(quantity.value)) {
    return;
  }

  if (errorMessage.value) {
    emit("update:validation", {
      isValid: false,
      errorMessage: errorMessage.value,
    });
  }

  setValue(quantity.value);

  const { valid } = await validate();

  if (!valid) {
    return;
  }

  emit("update:validation", { isValid: true });

  clearTimeout(timeoutIdOfQuantityChange);
  timeoutIdOfQuantityChange = +setTimeout(changeQuantity, 900);
}

function onFocusOut() {
  if (!isQuantity(quantity.value)) {
    quantity.value = props.modelValue;
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key.toLowerCase() === "e" || e.key === "-" || e.key === "." || e.key === ",") {
    e.preventDefault();
  }
}

function isQuantity(qty: unknown): qty is number {
  const qtyAsNumber = Number(quantity.value);
  return !isNaN(qtyAsNumber) && Number(qtyAsNumber) >= 1;
}

watchEffect(() => {
  quantity.value = props.modelValue;
});
</script>
