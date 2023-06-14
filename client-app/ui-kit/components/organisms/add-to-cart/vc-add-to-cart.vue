<template>
  <div>
    <VcInput
      v-model.number="quantity"
      :disabled="disabled"
      :min-quantity="minQuantity"
      :max-quantity="maxQuantity"
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
          :disabled="disabled"
          :title="buttonText"
          size="sm"
          class="w-28"
          truncate
          @click="$emit('update:cartItemQuantity', quantity)"
        >
          {{ buttonText }}
        </VcButton>
      </template>
    </VcInput>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";

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

const isButtonOutlined = computed<boolean>(() => !props.countInCart);

const buttonText = computed<string>(() =>
  props.countInCart ? t("common.buttons.update_cart") : t("common.buttons.add_to_cart")
);

const quantity = ref<number | undefined>(props.modelValue);

function onChange(): void {
  const newQuantity = Number(quantity.value);

  if (isNaN(newQuantity) || newQuantity < 1 || newQuantity === props.modelValue) {
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
