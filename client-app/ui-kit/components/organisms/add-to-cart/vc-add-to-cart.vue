<template>
  <div>
    <VcInput
      v-model.number="quantity"
      :disabled="disabled"
      :min="minQuantity"
      :max="maxQuantity"
      single-line-message
      center
      class="w-full"
      type="number"
      size="sm"
      @input="onChange"
      @blur="onFocusOut"
    >
      <template #append>
        <VcButton
          :variant="isButtonOutlined ? 'outline' : 'solid'"
          :loading="loading"
          :disabled="disabled || !!errorMessage"
          :title="buttonText"
          size="sm"
          class="w-28"
          truncate
          @click="$emit('update:cartItemQuantity', quantity!)"
        >
          {{ buttonText }}
        </VcButton>
      </template>
    </VcInput>

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
  </div>
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
  (event: "update:cartItemQuantity", quantity: number): void;
}

interface IProps {
  modelValue?: number;
  loading?: boolean;
  disabled?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
  countInCart?: number;
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

const isButtonOutlined = computed<boolean>(() => !props.countInCart);

const buttonText = computed<string>(() =>
  props.countInCart ? t("common.buttons.update_cart") : t("common.buttons.add_to_cart"),
);

const quantity = ref<number | undefined>();

const { errorMessage, validate, setValue } = useField("quantity", rules, { initialValue: quantity.value });

async function onChange(): Promise<void> {
  setValue(quantity.value);

  const newQuantity = Number(quantity.value);

  if (isNaN(newQuantity) || newQuantity < 1 || newQuantity === props.modelValue) {
    return;
  }

  const { valid } = await validate();

  if (!valid) {
    return;
  }

  emit("update:modelValue", newQuantity);
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
