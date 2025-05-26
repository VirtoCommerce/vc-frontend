<template>
  <div class="vc-quantity-stepper">
    <VcInput
      v-model.number="model"
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
    >
      <template v-if="!readonly" #prepend>
        <VcButton
          icon="minus"
          :disabled="isDecrementDisabled"
          :loading="loading"
          :color="buttonsColor"
          :variant="buttonsVariant"
          @click="model && update(model - step)"
        />
      </template>

      <template v-if="!readonly" #append>
        <VcButton
          icon="plus"
          :disabled="isIncrementDisabled"
          :loading="loading"
          :color="buttonsColor"
          :variant="buttonsVariant"
          @click="model !== undefined && update(model + step)"
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

interface IEmits {
  (e: "update:value", value: number): void;
}

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
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  step: 1,
  value: 0,
  min: 0,
  size: "sm",
});

const model = defineModel<IProps["value"]>();

const isDecrementDisabled = computed(() => props.disabled || !model.value || (model.value && model.value <= props.min));

const isIncrementDisabled = computed(
  () => props.disabled || model.value === null || (!!props.max && model.value && model.value >= props.max),
);

function update(value: number) {
  model.value = value;
  emit("update:value", value);
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
            @apply w-44;
          }

          @container (min-width: theme("containers.xl")) {
            @apply mt-0 ms-3;
          }

          @container (min-width: theme("containers.4xl")) {
            @apply mt-0 ms-3;
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
