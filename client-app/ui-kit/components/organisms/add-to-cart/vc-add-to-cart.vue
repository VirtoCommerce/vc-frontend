<template>
  <div>
    <VcInput
      v-model.number="quantity"
      :disabled="disabled"
      :min="minQty"
      :max="maxQty"
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
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField } from "vee-validate";
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useQuantityValidationSchema } from "@/ui-kit/composables";

interface IEmits {
  (event: "update:modelValue", value: number): void;
  (event: "update:cartItemQuantity", quantity: number): void;
  (event: "update:validation", value: { isValid: true } | { isValid: false; errorMessage: string }): void;
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

const isButtonOutlined = computed<boolean>(() => !props.countInCart);
const minQty = computed(() => props.minQuantity);
const maxQty = computed(() => props.maxQuantity);

const buttonText = computed<string>(() =>
  props.countInCart ? t("common.buttons.update_cart") : t("common.buttons.add_to_cart"),
);

const quantity = ref<number | undefined>();

const { quantitySchema } = useQuantityValidationSchema(minQty.value, maxQty.value);

const rules = computed(() => toTypedSchema(quantitySchema.value));

const { errorMessage, validate, setValue } = useField("quantity", rules);

async function validateFields(): Promise<void> {
  const { valid } = await validate();

  if (!valid && errorMessage.value) {
    emit("update:validation", { isValid: false, errorMessage: errorMessage.value });
  } else {
    emit("update:validation", { isValid: true });
  }
}

async function onChange(): Promise<void> {
  setValue(quantity.value);

  const newQuantity = Number(quantity.value);

  if (isNaN(newQuantity) || newQuantity < 1 || newQuantity === props.modelValue) {
    return;
  }

  await validateFields();

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

watchEffect(async () => {
  setValue(quantity.value);
  await validateFields();
});
</script>
