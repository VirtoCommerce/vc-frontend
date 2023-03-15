<template>
  <component
    :is="isLink ? 'router-link' : 'button'"
    :to="isEnabled ? to : ''"
    :type="isLink ? null : isSubmit ? 'submit' : 'button'"
    :disabled="!isEnabled"
    :class="[
      'vc-button',
      `vc-button--${size}`,
      `vc-button--${kind}`,
      {
        'vc-button--outline': isOutline,
        'vc-button--disabled': !isEnabled,
        'vc-button--loading': isWaiting,
      },
    ]"
    @click="isEnabled ? $emit('click', $event) : null"
  >
    <span class="vc-button__content">
      <slot />
    </span>
  </component>
</template>

<script setup lang="ts">
import { eagerComputed } from "@vueuse/core";
import type { PropType } from "vue";
import type { RouteLocationRaw } from "vue-router";

defineEmits(["click"]);

const props = defineProps({
  kind: {
    type: String as PropType<"primary" | "secondary" | "success" | "warning" | "danger" | "custom">,
    default: "primary",
    validator: (value: string) => ["primary", "secondary", "success", "warning", "danger", "custom"].includes(value),
  },

  size: {
    type: String as PropType<"sm" | "md" | "lg">,
    default: "md",
    validator: (value: string) => ["sm", "md", "lg"].includes(value),
  },

  isSubmit: {
    type: Boolean,
    default: false,
  },

  isOutline: {
    type: Boolean,
    default: false,
  },

  isDisabled: {
    type: Boolean,
    default: false,
  },

  isWaiting: {
    type: Boolean,
    default: false,
  },

  to: {
    type: [String, Object] as PropType<RouteLocationRaw>,
    default: null,
  },
});

const isEnabled = eagerComputed<boolean>(() => !props.isDisabled && !props.isWaiting);
const isLink = eagerComputed<boolean>(() => !!props.to && isEnabled.value);
</script>

<style scoped lang="scss">
$colors: primary, secondary, success, warning, danger;

.vc-button {
  $self: &;

  @apply relative inline-flex justify-center items-center rounded
  border-2 border-transparent font-roboto-condensed select-none
  focus:outline outline-[3px] outline-[color:var(--color-primary-light)];

  &__content {
    @apply flex justify-center items-center;
  }

  &--sm {
    @apply h-8 text-sm;
  }

  &--md {
    @apply h-9 text-base;
  }

  &--lg {
    @apply h-11 text-lg;
  }

  &--disabled {
    @apply bg-gray-200 text-gray-400 cursor-not-allowed
    [--tw-bg-opacity:0.7] [--tw-text-opacity:0.7] #{!important};

    &#{$self}--outline {
      @apply bg-transparent border-gray-300 [--tw-border-opacity:0.8] #{!important};
    }
  }

  &--loading {
    #{$self}__content {
      visibility: hidden;
    }

    &::after {
      @apply border-[3px] rounded-full animate-spin border-gray-400 border-r-gray-300;

      --tw-border-opacity: 0.7 !important;

      content: " ";
      height: 1.25rem;
      width: 1.25rem;
      margin: -0.625rem 0 0 -0.625rem;
      position: absolute;
      left: 50%;
      top: 50%;
    }

    &#{$self}--outline {
      &::after {
        @apply border-gray-400 border-r-gray-200;
        --tw-border-opacity: 0.6 !important;
      }
    }
  }

  @each $color in $colors {
    &--#{$color} {
      @apply bg-[color:var(--color-#{$color})] hover:bg-[color:var(--color-#{$color}-hover)] text-white;

      &#{$self}--outline {
        @apply bg-transparent hover:bg-[color:var(--color-#{$color}-hover)]
        border-[color:var(--color-#{$color})] hover:border-[color:var(--color-#{$color}-hover)]
        text-[color:var(--color-#{$color})] hover:text-white;
      }
    }
  }
}
</style>
