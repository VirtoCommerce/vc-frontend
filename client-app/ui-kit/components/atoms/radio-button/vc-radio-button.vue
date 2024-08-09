<template>
  <div
    :class="[
      'vc-radio-button',
      `vc-radio-button--size--${size}`,
      `vc-radio-button--label--${labelPosition}`,
      {
        'vc-radio-button--disabled': disabled,
        'vc-radio-button--checked': checked,
      },
    ]"
  >
    <label class="vc-radio-button__container">
      <input
        v-model="model"
        class="vc-radio-button__input"
        type="radio"
        :name="name"
        :value="value"
        :checked="checked"
        :disabled="disabled"
        :aria-checked="checked"
      />

      <span class="vc-radio-button__label">
        <slot v-bind="{ checked, value, label }">
          {{ label }}
        </slot>
      </span>
    </label>

    <VcInputDetails
      class="vc-radio-button__details"
      :show-empty="showEmptyDetails"
      :message="message"
      :error="error"
      :single-line="singleLineMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IProps {
  label?: string;
  name?: string;
  value: string;
  disabled?: boolean;
  size?: "xs" | "sm" | "md";
  labelPosition?: "left" | "right";
  showEmptyDetails?: boolean;
  message?: string;
  error?: boolean;
  singleLineMessage?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  size: "md",
  labelPosition: "right",
});

const model = defineModel<IProps["value"]>();

const checked = computed(() => model.value === props.value);
</script>

<style lang="scss">
.vc-radio-button {
  $checked: "";
  $disabled: "";
  $left: "";
  $right: "";

  @apply select-none;

  &--size {
    &--xs {
      --size: 0.875rem;
      --border-width: 0.25rem;

      @apply text-xs;
    }

    &--sm {
      --size: 1rem;
      --border-width: 0.3rem;

      @apply text-sm;
    }

    &--md {
      --size: 1.25rem;
      --border-width: 0.375rem;

      @apply text-base;
    }
  }

  &--label {
    &--left {
      $left: &;
    }

    &--right {
      $right: &;
    }
  }

  &--checked {
    $checked: &;
  }

  &--disabled {
    $disabled: &;
  }

  &__container {
    @apply flex items-center cursor-pointer;

    #{$disabled} & {
      @apply cursor-not-allowed;
    }
  }

  &__input {
    @apply flex-none size-[--size] appearance-none border-2 rounded-full border-neutral-400 bg-additional-50;

    &:checked {
      @apply border-primary border-[length:var(--border-width)];
    }

    &:focus {
      @apply outline-none ring ring-primary-500/20;
    }

    &:disabled {
      @apply border-neutral-400 bg-neutral-50;
    }
  }

  &__label {
    @apply min-w-0;

    #{$left} & {
      @apply order-first me-2;
    }

    #{$right} & {
      @apply order-last ms-2;
    }

    #{$disabled} & {
      @apply opacity-60;
    }
  }

  &__details {
    @apply min-w-full;
  }
}
</style>
