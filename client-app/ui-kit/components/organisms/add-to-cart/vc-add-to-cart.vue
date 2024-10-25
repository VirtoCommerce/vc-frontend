<template>
  <div class="vc-add-to-cart" :class="{ 'vc-add-to-cart--hide-button': hideButton }">
    <VcInput
      v-model.number="quantity"
      :name
      type="number"
      :aria-label="$t('common.labels.product_quantity')"
      :disabled="disabled"
      :max="maxQuantity"
      :min="minQuantity"
      size="sm"
      single-line-message
      center
      :error="!isValid || error"
      :message="message"
      :show-empty-details="showEmptyDetails"
      :readonly
      @input="onChange"
      @blur="onFocusOut"
    >
      <template #append>
        <template v-if="!hideButton">
          <VcButton
            class="vc-add-to-cart__icon-button"
            :variant="isButtonOutlined ? 'outline' : 'solid'"
            :loading="loading"
            :disabled="isDisabled"
            :title="buttonText"
            :icon="icon"
            size="sm"
            @click.stop="$emit('update:cartItemQuantity', quantity!)"
          />

          <VcButton
            v-if="!hideButton"
            class="vc-add-to-cart__text-button"
            :variant="isButtonOutlined ? 'outline' : 'solid'"
            :loading="loading"
            :disabled="isDisabled"
            :title="buttonText"
            size="sm"
            truncate
            @click.stop="$emit('update:cartItemQuantity', quantity!)"
          >
            {{ buttonText }}
          </VcButton>
        </template>
        <slot name="append" />
      </template>
    </VcInput>

    <div v-if="$slots.default" class="vc-add-to-cart__badges">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { toRefs } from "@vueuse/core";
import { debounce } from "lodash";
import { useField } from "vee-validate";
import { computed, onMounted, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import { useQuantityValidationSchema } from "@/ui-kit/composables";

interface IEmits {
  (event: "update:modelValue", value: number): void;
  (event: "update:cartItemQuantity", quantity: number): void;
  (event: "update:validation", value: { isValid: true } | { isValid: false; errorMessage: string }): void;
}

interface IProps {
  name?: string;
  modelValue?: number;
  loading?: boolean;
  disabled?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
  packSize?: number;
  countInCart?: number;
  availableQuantity?: number;
  isActive?: boolean;
  isAvailable?: boolean;
  isBuyable?: boolean;
  isInStock?: boolean;
  message?: string;
  showEmptyDetails?: boolean;
  error?: boolean;
  hideButton?: boolean;
  readonly?: boolean;
  timeout?: number;
  validateOnMount?: boolean;
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  validateOnMount: true,
});

const { t } = useI18n();

const isValid = ref(true);

const {
  timeout,
  disabled,
  isInStock,
  minQuantity,
  maxQuantity,
  availableQuantity,
  isActive,
  isAvailable,
  isBuyable,
  packSize,
} = toRefs(props);

const isButtonOutlined = computed<boolean>(() => !props.countInCart);

const buttonText = computed<string>(() =>
  props.countInCart ? t("common.buttons.update_cart") : t("common.buttons.add_to_cart"),
);

const icon = computed<"refresh" | "cart">(() => (props.countInCart ? "refresh" : "cart"));

// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const quantity = ref<number | undefined>(props.modelValue);
const pendingQuantity = ref<number | null>(null);

const { quantitySchema } = useQuantityValidationSchema({
  minQuantity,
  maxQuantity,
  availableQuantity,
  packSize,
});

const rules = computed(() => toTypedSchema(quantitySchema.value));
const isDisabled = computed(
  () => !isValid.value || disabled.value || !isActive || !isAvailable.value || !isBuyable.value || !isInStock.value,
);

const {
  errorMessage,
  validate,
  setValue,
  value: fieldValue,
} = useField("quantity", rules, {
  initialValue: quantity.value,
});

async function validateFields(): Promise<void> {
  if (isInStock.value) {
    const { valid } = await validate();
    isValid.value = valid;
    if (!valid && errorMessage.value) {
      emit("update:validation", { isValid: false, errorMessage: errorMessage.value });
    } else {
      emit("update:validation", { isValid: true });
    }
  } else {
    isValid.value = true;
    emit("update:validation", { isValid: true });
  }
}

const handleChange = debounce(async () => {
  setValue(quantity.value);

  const newQuantity = Number(quantity.value);

  if (
    isNaN(newQuantity) ||
    newQuantity < 1 ||
    newQuantity === props.modelValue ||
    pendingQuantity.value === newQuantity
  ) {
    return;
  }

  await validateFields();

  emit("update:modelValue", newQuantity);
  pendingQuantity.value = newQuantity;
}, timeout.value ?? 0);

function onChange() {
  if (quantity.value && quantity.value > LINE_ITEM_QUANTITY_LIMIT) {
    quantity.value = Number(quantity.value.toString().slice(0, -1));
  }
  void handleChange();
}

function onFocusOut() {
  const newQuantity = Number(quantity.value);

  if (isNaN(newQuantity) || newQuantity < 1) {
    quantity.value = props.modelValue;
  }
}

watchEffect(() => {
  quantity.value = props.modelValue;
  pendingQuantity.value = null;
});

onMounted(async () => {
  if (props.validateOnMount) {
    await validateFields();
  }
});

watchEffect(async () => {
  if (quantity.value !== fieldValue.value) {
    setValue(quantity.value);
    await validateFields();
  }
});
</script>

<style lang="scss">
.vc-add-to-cart {
  @apply @container flex-none;

  &__icon-button.vc-button {
    @apply w-24 max-w-full;

    @container (width > theme("containers.xxs")) {
      @apply hidden;
    }
  }

  &__text-button.vc-button {
    @apply hidden;

    @container (width > theme("containers.xxs")) {
      @apply block w-32;
    }
  }

  &__badges {
    @apply mt-1.5 flex flex-wrap gap-x-1.5 gap-y-0.5;
  }
}
</style>
