<template>
  <VcInput
    v-model="quantity"
    :name="name"
    :readonly="readonly"
    :disabled="disabled"
    :min="minQuantity"
    :max="maxQuantity"
    :error="error"
    class="vc-quantity"
    size="sm"
    type="number"
    center
    truncate
    @keydown="onKeydown"
    @keyup.enter="changeQuantity"
    @input="onQuantityChanged"
    @blur="onFocusOut"
  />

  <VcTooltip v-if="errorMessage" class="!block" :x-offset="28" placement="bottom-start" strategy="fixed">
    <template #trigger>
      <div class="line-clamp-1 pt-0.5 text-xs text-danger">
        {{ errorMessage }}
      </div>
    </template>

    <template #content>
      <div class="w-52 rounded-sm bg-additional-50 px-3.5 py-1.5 text-xs text-neutral-800 shadow-sm-x-y">
        {{ errorMessage }}
      </div>
    </template>
  </VcTooltip>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField } from "vee-validate";
import { computed, ref, toRefs, watchEffect } from "vue";
import { useQuantityValidationSchema } from "@/ui-kit/composables";

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

const quantity = ref<number | undefined>();

const { minQuantity, maxQuantity } = toRefs(props);

const { quantitySchema } = useQuantityValidationSchema({ minQuantity, maxQuantity });

const rules = computed(() => toTypedSchema(quantitySchema.value));

const { errorMessage, setValue, validate } = useField("quantity", rules);

function changeQuantity() {
  clearTimeout(timeoutIdOfQuantityChange);

  if (!isQuantity(quantity.value) || quantity.value === props.modelValue) {
    return;
  }

  emit("update:modelValue", quantity.value);
}

async function onQuantityChanged(): Promise<void> {
  if (!isQuantity(quantity.value)) {
    return;
  }

  setValue(quantity.value);

  const { valid } = await validate();

  if (!valid) {
    return;
  }

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

<style lang="scss">
.vc-quantity {
  @apply w-[5.625rem] flex-none;
}
</style>
