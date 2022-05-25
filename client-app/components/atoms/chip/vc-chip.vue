<template>
  <component
    :is="clickable ? 'button' : 'span'"
    :disabled="isDisabled"
    :draggable="isDraggable && !isDisabled"
    :class="[
      'vc-chip',
      `vc-chip--${size}`,
      `vc-chip--${variant}`,
      {
        'vc-chip--outline': isOutline,
        'vc-chip--disabled': isDisabled,
        'vc-chip--clickable': clickable,
      },
    ]"
  >
    <span class="vc-chip__content">
      <slot />

      <button
        v-if="closable"
        :disabled="isDisabled"
        class="vc-chip__close-button"
        @click.stop="isDisabled ? null : $emit('close')"
      >
        <slot name="close-icon">
          <svg width="10" height="10">
            <use href="/static/images/close.svg#main" />
          </svg>
        </slot>
      </button>
    </span>
  </component>
</template>

<script setup lang="ts">
defineEmits(["close"]);

defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (value: string) => ["primary", "secondary", "success", "warning", "danger"].includes(value),
  },

  size: {
    type: String,
    default: "md",
    validator(value: string) {
      return ["sm", "md", "lg"].includes(value);
    },
  },

  clickable: {
    type: Boolean,
    default: false,
  },

  closable: {
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

  isDraggable: {
    type: Boolean,
    default: null,
  },
});
</script>

<style scoped lang="scss">
$colors: primary, secondary, success, warning, danger;

.vc-chip {
  $self: &;

  @apply relative inline-flex justify-center items-center rounded
  border border-transparent font-bold whitespace-nowrap select-none
  focus:outline-dotted outline-1 outline-offset-[3px] px-2.5;

  &__content {
    @apply flex items-center justify-center;
  }

  &__close-button {
    @apply p-2 -mr-2;
  }

  &--sm {
    @apply h-8 text-sm;
  }

  &--md {
    @apply h-9 text-base;

    #{$self}__close-button {
      @apply scale-110 ml-px;
    }
  }

  &--lg {
    @apply h-11 text-lg;

    #{$self}__close-button {
      @apply scale-125 ml-0.5 -mr-1.5;
    }
  }

  &--disabled {
    @apply bg-gray-200 text-gray-400 #{!important};

    --tw-bg-opacity: 0.7 !important;
    --tw-text-opacity: 0.7 !important;

    &#{$self}--outline {
      @apply bg-transparent border-gray-300 #{!important};

      --tw-text-opacity: 0.7 !important;
      --tw-border-opacity: 0.8 !important;
    }
  }

  &--clickable {
    @apply cursor-pointer;

    &#{$self}--disabled,
    &#{$self}--disabled #{$self}__close-button {
      @apply cursor-not-allowed;
    }
  }

  @each $color in $colors {
    &--#{$color} {
      @apply bg-[color:var(--color-#{$color})] hover:bg-[color:var(--color-#{$color}-hover)]
      outline-[color:var(--color-#{$color})] text-white;

      &#{$self}--outline {
        @apply bg-transparent
        border-[color:var(--color-#{$color})] hover:border-[color:var(--color-#{$color}-hover)]
        text-[color:var(--color-#{$color})] hover:text-[color:var(--color-#{$color}-hover)];
      }
    }
  }
}
</style>
