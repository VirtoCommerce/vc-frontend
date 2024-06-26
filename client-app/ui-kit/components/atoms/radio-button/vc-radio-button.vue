<template>
  <label :class="['vc-radio-button', `vc-radio-button--size--${size}`, checked && 'vc-radio-button--checked']">
    <input
      class="vc-radio-button__input"
      type="radio"
      :value="value"
      :checked="checked"
      :aria-checked="checked"
      @change="$emit('update:modelValue', value)"
    />
    <slot v-bind="{ checked, value, label }">
      <span class="vc-radio-button__text">{{ label }}</span>
    </slot>
  </label>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

const props = withDefaults(defineProps<IProps>(), {
  size: "md",
});

interface IProps {
  label?: string;
  value: string;
  modelValue?: string;
  size?: "sm" | "md";
}

const checked = computed(() => props.modelValue === props.value);
</script>

<style lang="scss">
.vc-radio-button {
  @apply inline-flex cursor-pointer items-center gap-2;

  &--size {
    &--sm {
      --size: 1.125rem;
      --border-width: 5px;

      @apply text-sm;
    }

    &--md {
      --size: 1.25rem;
      --border-width: 6px;

      @apply text-base;
    }
  }

  &--checked {
    @apply text-neutral-500;
  }

  &__input {
    @apply size-[--size] appearance-none rounded-full border-neutral-300 bg-additional-50 checked:border-primary focus:outline-none focus:ring focus:ring-primary-100;

    border-width: var(--border-width);
  }

  &__text {
    @apply font-normal;
  }
}
</style>
