<template>
  <VcInput
    v-model.number="quantity"
    :disabled="disabled || loading"
    :min="minQuantity"
    :max="maxQuantity"
    :aria-label="$t('common.labels.product_quantity')"
    single-line-message
    center
    class="vc-add-to-cart"
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
        class="vc-add-to-cart__button"
        truncate
        @click="$emit('update:cartItemQuantity', quantity!)"
      >
        {{ buttonText }}
      </VcButton>
    </template>
  </VcInput>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { toRefs } from "@vueuse/core";
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
  availableQuantity?: number;
  isInStock?: boolean;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const { t } = useI18n();

const { isInStock, minQuantity, maxQuantity, availableQuantity } = toRefs(props);

const isButtonOutlined = computed<boolean>(() => !props.countInCart);

const buttonText = computed<string>(() =>
  props.countInCart ? t("common.buttons.update_cart") : t("common.buttons.add_to_cart"),
);

const quantity = ref<number | undefined>();

const { quantitySchema } = useQuantityValidationSchema({
  minQuantity,
  maxQuantity,
  availableQuantity,
  isInStock,
});

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

<style lang="scss">
.vc-add-to-cart {
  @apply w-full;

  &__button {
    @apply w-28;
  }
}
</style>
