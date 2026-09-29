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

  // A control taller than `sm` does NOT get a label to match: the caption stops growing at 14,
  // which is where the design holds it for every field it labels — a `md` select included. Pass
  // `size` explicitly for the rare label that has to track its control.
  return "sm";
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
