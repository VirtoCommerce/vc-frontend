<template>
  <label :class="['vc-radio-button', `vc-radio-button--size--${size}`, checked && 'vc-radio-button--checked']">
    <input
      v-model="model"
      class="vc-radio-button__input flex-none"
      type="radio"
      :value="value"
      :checked="checked"
      :aria-checked="checked"
    />
    <slot v-bind="{ checked, value, label }">
      <span class="vc-radio-button__text">{{ label }}</span>
    </slot>
  </label>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IProps {
  label?: string;
  value: string;
  size?: "sm" | "md";
}

const props = withDefaults(defineProps<IProps>(), {
  size: "md",
});

const model = defineModel<IProps["value"]>();

const checked = computed(() => model.value === props.value);
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
    .vc-radio-button__text {
      @apply text-neutral-950;
    }

    .vc-radio-button__input {
      border-width: var(--border-width);
    }
  }

  &__input {
    @apply size-[--size] appearance-none border-2 rounded-full border-neutral-300 bg-additional-50 checked:border-primary focus:outline-none focus:ring focus:ring-primary-100;
  }

  &__text {
    @apply font-normal text-neutral;
  }
}
</style>
