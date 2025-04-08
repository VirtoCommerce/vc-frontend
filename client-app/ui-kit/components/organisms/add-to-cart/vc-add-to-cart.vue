<template>
  <div class="vc-add-to-cart" :class="{ 'vc-add-to-cart--hide-button': hideButton }">
    <VcInput
      v-model.number="quantity"
      :name="name"
      type="number"
      :aria-label="$t('ui_kit.labels.product_quantity')"
      :disabled="disabled"
      :max="maxQuantity"
      :min="minQuantity"
      :size="size"
      single-line-message
      center
      :error="!isValid || error"
      :message="message"
      :show-empty-details="showEmptyDetails"
      :readonly="readonly"
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
            @click.stop="$emit('update:cartItemQuantity', quantity!)"
          />

          <VcButton
            v-if="!hideButton"
            class="vc-add-to-cart__text-button"
            :variant="isButtonOutlined ? 'outline' : 'solid'"
            :loading="loading"
            :disabled="isDisabled"
            :title="buttonText"
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
import { computed, onMounted, ref, toRef, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import { useQuantityValidationSchema } from "@/ui-kit/composables";
import { AddToCartModeType } from "@/ui-kit/enums";

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
  size?: "xs" | "sm" | "md";
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  validateOnMount: true,
  size: "sm",
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
  countInCart,
} = toRefs(props);

const mode = computed(() => (countInCart.value ? AddToCartModeType.Update : AddToCartModeType.Add));
const isButtonOutlined = computed<boolean>(() => mode.value === AddToCartModeType.Add);

const buttonText = computed<string>(() =>
  mode.value === AddToCartModeType.Update ? t("ui_kit.buttons.update_cart") : t("ui_kit.buttons.add_to_cart"),
);

const icon = computed<"refresh" | "cart">(() => (mode.value === AddToCartModeType.Update ? "refresh" : "cart"));

const modelValue = toRef(props, "modelValue");
const quantity = ref<number | undefined>(modelValue.value);
const pendingQuantity = ref<number | null>(null);

const { quantitySchema } = useQuantityValidationSchema({
  minQuantity,
  maxQuantity,
  availableQuantity,
  packSize,
});

const rules = computed(() => toTypedSchema(quantitySchema.value));
const isDisabled = computed(
  () =>
    !isValid.value || disabled.value || !isAvailable.value || !isBuyable.value || !isInStock.value || !isActive?.value,
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
  if (isInStock.value && !isDisabled.value) {
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
    newQuantity === modelValue.value ||
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
    quantity.value = modelValue.value;
  }
}

watchEffect(() => {
  quantity.value = modelValue.value;
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
  $self: &;
  $hideButton: &;

  @apply @container flex-none;

  &--hide-button {
    $hideButton: &;
  }

  &__icon-button.vc-button {
    @container (width > theme("containers.xxs")) {
      @apply hidden;
    }
  }

  &__text-button.vc-button {
    @apply hidden;

    @container (width > theme("containers.xxs")) {
      @apply block;
    }
  }

  &__badges {
    @apply mt-1.5 flex flex-wrap gap-x-1.5 gap-y-0.5 empty:hidden;
  }

  @at-root .vc-product-card {
    #{$self} {
      grid-area: add-to-cart;
    }

    &--view-mode {
      &--grid {
        #{$self} {
          @apply mt-3;

          @container (min-width: theme("containers.xs")) {
            @apply mt-4;
          }
        }
      }

      &--list {
        #{$self} {
          @apply mt-3;

          @container (min-width: theme("containers.sm")) {
            @apply w-72;
          }

          @container (min-width: theme("containers.xl")) {
            @apply mt-0 ms-3 w-44;
          }

          @container (min-width: theme("containers.4xl")) {
            @apply mt-0 ms-3 w-60;
          }
        }
      }

      &--item {
        #{$hideButton} {
          @apply mt-3 w-[5rem] self-start;

          @container (min-width: theme("containers.xl")) {
            @apply w-[6.75rem] self-center;
          }

          @container (min-width: theme("containers.2xl")) {
            @apply mt-0 ms-3 w-[5.5rem];
          }
        }
      }
    }
  }
}
</style>
