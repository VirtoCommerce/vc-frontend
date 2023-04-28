<template>
  <div>
    <VcInput
      v-model.number="enteredQuantity"
      :disabled="disabled"
      :min-quantity="item.minQuantity"
      :max-quantity="item.maxQuantity"
      :error="!!errorMessage"
      :message="errorMessage"
      single-line-message
      center
      class="w-full"
      type="number"
      size="sm"
      @input="onChange"
    >
      <template #append>
        <VcButton
          :is-outline="isButtonOutlined"
          :is-waiting="loading"
          :is-disabled="disabled || !!errorMessage"
          :title="buttonText"
          class="!h-full w-28 !rounded-[inherit] uppercase"
          size="sm"
          @click="$emit('update:cartItemQuantity', enteredQuantity)"
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
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { number } from "yup";
import { ProductType } from "@/core/enums";
import type { PreparedLineItemType } from "@/core/types";

interface IEmits {
  (event: "update:modelValue", value: number): void;
  (event: "update:cartItemQuantity", quantity: number): void;
}

interface IProps {
  loading?: boolean;
  item: PreparedLineItemType;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const MAX_VALUE = 999999;

const { t } = useI18n();

const isButtonOutlined = computed<boolean>(() => props.item.countInCart === 0);
const minQty = computed<number>(() => props.item.minQuantity || 1);
const maxQty = computed<number>(() =>
  Math.min(props.item.product?.availabilityData?.availableQuantity || MAX_VALUE, props.item.maxQuantity || MAX_VALUE)
);

const buttonText = computed<string>(() =>
  props.item.countInCart ? t("common.buttons.update_cart") : t("common.buttons.add_to_cart")
);

const disabled = computed<boolean>(
  () =>
    !props.item.actualPrice ||
    !props.item.product?.availabilityData?.isAvailable ||
    !props.item.product?.availabilityData?.isInStock ||
    !props.item.product?.availabilityData?.isBuyable ||
    (!props.item.product?.availabilityData?.availableQuantity && props.item.productType === ProductType.Physical)
);

const rules = computed(() =>
  toTypedSchema(
    number()
      .typeError(t("shared.cart.add_to_cart.errors.enter_correct_number_message"))
      .required(t("common.messages.required_field"))
      .integer()
      .positive()
      .min(minQty.value, ({ min }) => t("shared.cart.add_to_cart.errors.min", [min]))
      .max(maxQty.value, ({ max }) => t("shared.cart.add_to_cart.errors.max", [max]))
  )
);

const initialValue = ref(disabled.value ? undefined : props.item.quantity);

const { value: enteredQuantity, errorMessage, validate, setValue } = useField("quantity", rules, { initialValue });

async function onChange(): Promise<void> {
  if (enteredQuantity.value && isNaN(enteredQuantity.value)) {
    setValue(minQty.value);
  }

  if (!enteredQuantity.value) {
    setValue(undefined);
  }

  const { valid } = await validate();

  if (valid && !disabled.value) {
    emit("update:modelValue", enteredQuantity.value!);
  }
}
</script>
