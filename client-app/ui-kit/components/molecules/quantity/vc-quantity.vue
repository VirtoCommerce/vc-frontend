<template>
  <VcInput
    v-model="quantity"
    :name="name"
    :readonly="readonly"
    :disabled="disabled"
    :min="minQuantity"
    :max="maxQuantity"
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

  <VcTooltip v-if="errorMessage" class="!block" :x-offset="28" placement="bottom-start" strategy="fixed">
    <template #trigger>
      <div class="line-clamp-1 pt-0.5 text-11 text-[color:var(--color-danger)]">
        {{ errorMessage }}
      </div>
    </template>

    <template #content>
      <div class="w-52 rounded-sm bg-white px-3.5 py-1.5 text-xs text-tooltip shadow-sm-x-y">
        {{ errorMessage }}
      </div>
    </template>
  </VcTooltip>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField } from "vee-validate";
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { number } from "yup";
import { useFieldValidationSchema } from "@/core/composables";

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

const { t } = useI18n();
const { mutateQuantityFieldSchema } = useFieldValidationSchema();

const rules = computed(() =>
  toTypedSchema(
    number()
      .typeError(t("shared.cart.add_to_cart.errors.enter_correct_number_message"))
      .integer()
      .positive()
      .withMutation((schema) => mutateQuantityFieldSchema(schema, props.minQuantity, props.maxQuantity)),
  ),
);

let timeoutIdOfQuantityChange: number;

const quantity = ref<number | undefined>();

const { errorMessage, setValue, validate } = useField("quantity", rules, {
  initialValue: quantity.value,
});

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

async function onQuantityChanged(): Promise<void> {
  setValue(quantity.value);

  const { valid } = await validate();

  if (!valid) {
    return;
  }

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
