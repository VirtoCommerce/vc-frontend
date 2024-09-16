<template>
  <VcInput
    v-model="quantity"
    :name="name"
    :readonly="readonly"
    :disabled="disabled"
    :error="error || !!errorMessage"
    :message="errorMessage"
    :aria-label="$t('common.labels.product_quantity')"
    single-line-message
    class="vc-quantity"
    size="sm"
    type="number"
    center
    truncate
    test-id-input="vc-quantity-input"
    @keydown="onKeydown"
    @keyup.enter="changeQuantity"
    @input="onQuantityChanged"
    @blur="onFocusOut"
  >
    <template #prepend>
      <slot name="prepend" />
    </template>

    <template #append>
      <slot name="append" />
    </template>
  </VcInput>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField } from "vee-validate";
import { computed, ref, toRefs, watchEffect } from "vue";
import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
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
  timeout?: number;
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  timeout: 900,
});

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

  if (quantity.value > LINE_ITEM_QUANTITY_LIMIT) {
    quantity.value = props.modelValue;
  }

  setValue(quantity.value);

  const { valid } = await validate();

  if (!valid) {
    return;
  }

  clearTimeout(timeoutIdOfQuantityChange);
  timeoutIdOfQuantityChange = +setTimeout(changeQuantity, props.timeout);
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
  @apply flex-none;
}
</style>
