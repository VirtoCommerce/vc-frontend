<template>
  <component
    :is="isLink ? 'router-link' : 'button'"
    :to="isEnabled ? to : ''"
    :type="isLink ? null : isSubmit ? 'submit' : 'button'"
    :disabled="!isEnabled"
    :autofocus="autofocus"
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
    @click="isEnabled ? $emit('click') : null"
  >
    <span class="vc-button__content">
      <slot />
    </span>
  </component>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { RouteLocationRaw } from "vue-router";
import { eagerComputed } from "@vueuse/core";

const props = defineProps({
  kind: {
    type: String,
    default: "primary",
    validator: (value: string) => ["primary", "secondary", "success", "warning", "danger"].includes(value),
  },

  size: {
    type: String,
    default: "md",
    validator: (value: string) => ["sm", "md", "lg"].includes(value),
  },

  autofocus: {
    type: Boolean,
    default: false,
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

defineEmits(["click"]);

const isEnabled = eagerComputed(() => !props.isDisabled && !props.isWaiting);
const isLink = eagerComputed(() => !!props.to && isEnabled.value);
</script>

<style scoped lang="scss">
$colors: primary, secondary, success, warning, danger;

.vc-button {
  $self: &;

  @apply relative inline-flex justify-center items-center rounded
    border-2 border-transparent font-roboto-condensed select-none
    focus:outline-dotted outline-1 outline-offset-[3px];

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
    @apply bg-gray-200 text-gray-400 cursor-not-allowed #{!important};

    --tw-bg-opacity: 0.7 !important;
    --tw-text-opacity: 0.7 !important;

    &#{$self}--outline {
      @apply bg-transparent border-gray-300 #{!important};

      --tw-text-opacity: 0.7 !important;
      --tw-border-opacity: 0.8 !important;
    }
  }

  &--loading {
    #{$self}__content {
      visibility: hidden;
    }

    &::after {
      @apply border-[3px] rounded-[50%] animate-spin border-gray-400 border-r-gray-300;

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
      @apply bg-[color:var(--color-#{$color})] hover:bg-[color:var(--color-#{$color}-hover)]
        outline-[color:var(--color-#{$color})] text-white;

      &#{$self}--outline {
        @apply bg-transparent hover:bg-[color:var(--color-#{$color}-hover)]
          border-[color:var(--color-#{$color})] hover:border-[color:var(--color-#{$color}-hover)]
          text-[color:var(--color-#{$color})] hover:text-white;
      }
    }
  }
}
</style>
