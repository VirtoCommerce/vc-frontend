<template>
  <div
    :class="[
      'vc-alert',
      `vc-alert--${variant}`,
      `vc-alert--${variant}--${color}`,
      `vc-alert--size--${size}`,
      {
        'vc-alert--shadow': shadow,
      },
    ]"
  >
    <slot name="main-icon">
      <VcIcon v-if="icon" :name="iconName" class="vc-alert__icon" />
    </slot>

    <div class="vc-alert__content">
      <div v-if="title" class="vc-alert__title">{{ title }}</div>

      <slot />
    </div>

    <div v-if="closable">
      <button type="button" class="vc-alert__close-button" @click="$emit('close')">
        <slot name="close-icon">
          <VcIcon name="delete-2" />
        </slot>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IEmits {
  (event: "close"): void;
}

interface IProps {
  color?: "success" | "warning" | "danger" | "info";
  icon?: boolean | string;
  variant?: "solid" | "solid-light" | "outline" | "outline-dark";
  size?: "sm" | "md";
  title?: string;
  shadow?: boolean;
  closable?: boolean;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  variant: "solid",
  color: "info",
  size: "md",
});

const iconName = computed<string>(() => {
  const { icon } = props;

  if (icon && typeof icon === "string") {
    return icon;
  }

  switch (props.color) {
    case "danger":
      return "delete";

    case "warning":
      return "exclamation-circle";

    case "success":
      return "check-circle";

    default:
      return "information-circle";
  }
});
</script>

<style lang="scss">
.vc-alert {
  $colors: success, warning, danger, info;
  $sizeSm: "";
  $sizeMd: "";

  @apply flex items-stretch border rounded;

  &--shadow {
    @apply shadow-lg;
  }

  &--size {
    &--sm {
      $sizeSm: &;

      @apply px-[0.438rem] py-[0.313rem] min-h-[1.875rem] text-xs/[0.875rem];
    }

    &--md {
      $sizeMd: &;

      @apply p-[0.688rem] min-h-[2.75rem] text-sm/[1.125rem];
    }
  }

  &--solid {
    @apply text-additional-50;

    @each $color in $colors {
      &--#{$color} {
        @apply bg-[--color-#{$color}-500] border-[--color-#{$color}-500];
      }
    }
  }

  &--solid-light {
    @apply text-neutral-900;

    @each $color in $colors {
      &--#{$color} {
        --vc-icon-color: var(--color-#{$color}-500);

        @apply bg-[--color-#{$color}-50] border-[--color-#{$color}-50];
      }
    }
  }

  &--outline {
    @apply bg-additional-50 text-neutral-900;

    @each $color in $colors {
      &--#{$color} {
        --vc-icon-color: var(--color-#{$color}-500);

        @apply border-[--color-#{$color}-500];
      }
    }
  }

  &--outline-dark {
    @apply text-neutral-900;

    @each $color in $colors {
      &--#{$color} {
        --vc-icon-color: var(--color-#{$color}-500);

        @apply bg-[--color-#{$color}-50] border-[--color-#{$color}-500];
      }
    }
  }

  &__icon {
    @apply shrink-0 me-2;

    #{$sizeSm} & {
      --vc-icon-size: 1.125rem;
    }

    #{$sizeMd} & {
      --vc-icon-size: 1.25rem;
    }
  }

  &__content {
    @apply grow flex flex-col justify-center;

    &:first-child {
      @apply ps-1;

      &:last-child {
        @apply px-1;
      }
    }
  }

  &__title {
    @apply mb-0.5 font-bold;
  }

  &__close-button {
    --vc-icon-color: currentColor;

    #{$sizeSm} & {
      --vc-icon-size: 1rem;

      @apply p-px;
    }

    #{$sizeMd} & {
      --vc-icon-size: 1.25rem;
    }
  }
}
</style>
