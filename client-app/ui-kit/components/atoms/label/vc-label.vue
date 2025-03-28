<template>
  <component
    :is="forId ? 'label' : 'div'"
    :for="forId"
    :class="[
      'vc-label',
      `vc-label--size--${_size}`,
      {
        'vc-label--error': error,
      },
    ]"
  >
    <slot />
    <span v-if="required" class="vc-label__asterisk">*</span>
  </component>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";

interface IProps {
  required?: boolean;
  error?: boolean;
  forId?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

const props = defineProps<IProps>();

const inputContext = inject<VcInputContextType | null>("inputContext", null);

const _size = computed(() => {
  if (props.size) {
    return props.size;
  }

  const inputSize = inputContext?.size.value;

  if (inputSize === "xs") {
    return "xs";
  }

  if (inputSize === "sm") {
    return "sm";
  }

  return "md";
});
</script>

<style lang="scss">
.vc-label {
  --color: var(--vc-label-color, theme("colors.neutral.950"));

  @apply mb-0.5 font-bold text-[--color];

  &--size {
    &--xs {
      @apply text-xs;
    }

    &--sm {
      @apply text-sm;
    }

    &--md {
      @apply text-base;
    }

    &--lg {
      @apply text-lg;
    }
  }

  &__asterisk {
    @apply ms-px text-danger;
  }
}
</style>
