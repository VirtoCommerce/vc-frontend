<template>
  <div>
    <VcInput
      v-model.number="enteredQuantity"
      :disabled="disabled"
      :min-quantity="minQuantity"
      :max-quantity="maxQuantity"
      :error="!!errorMessage"
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

    <VcTooltip v-if="!!errorMessage" :x-offset="28" class="!block" placement="bottom-start" strategy="fixed">
      <template #trigger>
        <div class="pt-0.5 text-11 text-[color:var(--color-danger)] xs:line-clamp-1">
          {{ errorMessage }}
        </div>
      </template>

      <template #content>
        <div class="w-52 rounded-sm bg-white py-1.5 px-3.5 text-xs text-tooltip shadow-sm-x-y">
          {{ errorMessage }}
        </div>
      </template>
    </VcTooltip>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField } from "vee-validate";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { number } from "yup";
import type { AvailabilityData } from "@/xapi/types";

interface IEmits {
  (event: "update:modelValue", value: number): void;
  (event: "update:cartItemQuantity", quantity: number): void;
}

interface IProps {
  modelValue: number;
  loading?: boolean;
  countInCart?: number;
  availabilityData?: AvailabilityData;
  minQuantity?: number;
  maxQuantity?: number;
}

defineEmits<IEmits>();
const props = defineProps<IProps>();

const MAX_VALUE = 999999;

const { t } = useI18n();

const isButtonOutlined = computed<boolean>(() => props.countInCart === 0);
const minQty = computed<number>(() => props.minQuantity || 1);
const maxQty = computed<number>(() =>
  Math.min(props.availabilityData?.availableQuantity, props.maxQuantity || MAX_VALUE)
);

const buttonText = computed<string>(() =>
  props.countInCart ? t("common.buttons.update_cart") : t("common.buttons.add_to_cart")
);

const disabled = computed<boolean>(
  () =>
    !(
      props.availabilityData?.isAvailable &&
      props.availabilityData?.isInStock &&
      props.availabilityData?.isBuyable &&
      props.availabilityData?.availableQuantity
    )
);

const rules = computed(() =>
  toTypedSchema(
    number()
      .typeError(t("shared.cart.add_to_cart.errors.enter_correct_number_message"))
      .integer()
      .positive()
      .min(minQty.value, ({ min }) => t("shared.cart.add_to_cart.errors.min", [min]))
      .max(maxQty.value, ({ max }) => t("shared.cart.add_to_cart.errors.max", [max]))
  )
);

const initialValue = ref(disabled.value ? undefined : props.modelValue);

const { value: enteredQuantity, validate, errorMessage } = useField("quantity", rules, { initialValue });

async function onChange(): Promise<void> {
  const { valid } = await validate();

  if (!valid || disabled.value) {
    return;
  }
}
</script>
