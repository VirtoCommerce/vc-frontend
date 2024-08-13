<template>
  <VcInput
    v-model.number="quantity"
    class="vc-add-to-cart"
    size="sm"
    type="number"
    :aria-label="$t('common.labels.product_quantity')"
    :disabled="disabled"
    :max="maxQuantity"
    :min="minQuantity"
    single-line-message
    center
    @input="onChange"
    @blur="onFocusOut"
  >
    <template #append>
      <VcButton
        class="vc-add-to-cart__icon-button"
        :variant="isButtonOutlined ? 'outline' : 'solid'"
        :loading="loading"
        :disabled="disabled || !!errorMessage"
        :title="buttonText"
        :icon="icon"
        size="sm"
        @click.stop="$emit('update:cartItemQuantity', quantity!)"
      />

      <VcButton
        class="vc-add-to-cart__text-button"
        :variant="isButtonOutlined ? 'outline' : 'solid'"
        :loading="loading"
        :disabled="disabled || !!errorMessage"
        :title="buttonText"
        size="sm"
        truncate
        @click.stop="$emit('update:cartItemQuantity', quantity!)"
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

const icon = computed<string>(() => (props.countInCart ? "refresh" : "cart"));

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
  @apply @container w-full;

  &__icon-button.vc-button {
    @apply w-14;

    @container (width > theme("containers.xxs")) {
      @apply hidden;
    }
  }

  &__text-button.vc-button {
    @apply hidden;

    @container (width > theme("containers.xxs")) {
      @apply block w-28;
    }
  }
}
</style>
