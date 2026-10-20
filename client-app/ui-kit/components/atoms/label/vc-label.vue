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

    <!-- A bound control announces "required" itself; a voiced asterisk would only repeat it. -->
    <span v-if="required" class="vc-label__asterisk" :aria-hidden="forId ? 'true' : undefined">*</span>
  </component>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";

interface IProps {
  required?: boolean;
  error?: boolean;
  /**
   * Renders a `<label for>` bound to this id instead of a `<div>`. A bound label hides the required asterisk from
   * assistive tech, so the control must expose `required` or `aria-required` itself.
   */
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
