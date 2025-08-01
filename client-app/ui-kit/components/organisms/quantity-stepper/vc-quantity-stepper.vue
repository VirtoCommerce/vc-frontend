<template>
  <div class="vc-quantity-stepper">
    <VcInput
      v-model.number="model"
      class="vc-quantity-stepper__input"
      type="number"
      :disabled="disabled"
      :readonly="readonly"
      :loading="loading"
      :error="error"
      :message="message"
      :size="size"
      :name="name"
      :show-empty-details="showEmptyDetails"
      single-line-message
      :min="min"
      :max="max"
      center
      :select-on-click="selectOnClick"
      :aria="{
        role: 'spinbutton',
        'aria-valuemin': min,
        'aria-valuemax': max,
        'aria-valuenow': model ?? '',
      }"
      :data-test-id="testIdInput"
    >
      <template v-if="!readonly" #prepend>
        <VcButton
          icon="minus"
          :disabled="isDecrementDisabled"
          :loading="loading"
          :color="buttonsColor"
          :variant="buttonsVariant"
          :data-test-id="testIdDecrement"
          class="vc-quantity-stepper__decrement"
          @click.stop="handleDecrement"
        />
      </template>

      <template v-if="!readonly" #append>
        <VcButton
          icon="plus"
          :disabled="isIncrementDisabled"
          :loading="loading"
          :color="buttonsColor"
          :variant="buttonsVariant"
          :data-test-id="testIdIncrement"
          class="vc-quantity-stepper__increment"
          @click.stop="handleIncrement"
        />
      </template>
    </VcInput>

    <div v-if="$slots.default" class="vc-quantity-stepper__badges">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { calculateStepper, checkIfOperationIsAllowed } from "@/ui-kit/utilities/quantity-stepper";

interface IProps {
  name?: string;
  value?: number;
  loading?: boolean;
  disabled?: boolean;
  step?: number;
  min?: number;
  max?: number;
  error?: boolean;
  message?: string;
  readonly?: boolean;
  buttonsColor?: VcButtonColorType;
  buttonsVariant?: VcButtonVariantType;
  size?: "sm" | "md";
  showEmptyDetails?: boolean;
  selectOnClick?: boolean;
  allowZero?: boolean;
  testIdInput?: string;
  testIdDecrement?: string;
  testIdIncrement?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  step: 1,
  max: Number.MAX_SAFE_INTEGER,
  size: "sm",
  allowZero: true,
});

const min = computed(() => props.min ?? (props.allowZero ? 0 : 1));

const model = defineModel<IProps["value"]>();

const isDecrementDisabled = computed(
  () =>
    props.disabled ||
    !checkIfOperationIsAllowed({
      value: model.value,
      step: props.step,
      min: min.value,
      max: props.max,
      allowZero: props.allowZero,
      direction: "decrement",
    }),
);

const isIncrementDisabled = computed(
  () =>
    props.disabled ||
    !checkIfOperationIsAllowed({
      value: model.value,
      step: props.step,
      min: min.value,
      max: props.max,
      allowZero: props.allowZero,
      direction: "increment",
    }),
);

function handleDecrement() {
  if (model.value === undefined || isDecrementDisabled.value) {
    return;
  }

  const newValue = calculateStepper({
    value: model.value,
    step: props.step,
    min: min.value,
    max: props.max,
    allowZero: props.allowZero,
    direction: "decrement",
  });
  update(newValue);
}

function handleIncrement() {
  if (model.value === undefined || isIncrementDisabled.value) {
    return;
  }

  const newValue = calculateStepper({
    value: model.value,
    step: props.step,
    min: min.value,
    max: props.max,
    allowZero: props.allowZero,
    direction: "increment",
  });
  update(newValue);
}

function update(value: number) {
  model.value = value;
}
</script>

<style lang="scss">
.vc-quantity-stepper {
  $self: &;

  @apply @container flex-none;

  &__badges {
    @apply mt-2 flex flex-wrap gap-x-1.5 gap-y-0.5 empty:hidden;
  }

  @at-root .vc-product-card {
    #{$self} {
      grid-area: add-to-cart;
    }

    &--view-mode {
      &--grid {
        #{$self} {
          @apply mt-3 order-7;
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
        #{$self} {
          @apply mt-3 w-32 self-start;

          @container (min-width: theme("containers.xl")) {
            @apply self-center;
          }

          @container (min-width: theme("containers.2xl")) {
            @apply mt-0 ms-3 w-36;
          }
        }
      }
    }
  }
}
</style>
