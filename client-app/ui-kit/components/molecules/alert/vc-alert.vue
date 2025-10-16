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
      <button
        type="button"
        class="vc-alert__close-button"
        :aria-label="$t('ui_kit.accessibility.close_alert')"
        @click="$emit('close')"
      >
        <slot name="close-icon">
          <VcIcon name="delete-thin" />
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

  --radius: var(--vc-alert-radius, var(--vc-radius, 0.5rem));
  --close-button-icon-color: var(--color-neutral-900);

  @apply flex items-stretch border rounded-[--radius] bg-[--bg-color] border-[--border-color] text-[--text-color];

  &--shadow {
    @apply shadow-lg;
  }

  &--size {
    &--sm {
      --icon-size: 1.125rem;

      @apply ps-[0.438rem] pe-[0.625rem] py-[0.313rem] min-h-[1.875rem] text-xs/[0.875rem];
    }

    &--md {
      --icon-size: 1.25rem;

      @apply p-[0.688rem] min-h-[2.75rem] text-sm/[1.125rem];
    }
  }

  &--solid {
    --text-color: var(--color-additional-50);
    --icon-color: var(--color-additional-50);

    @each $color in $colors {
      &--#{$color} {
        --bg-color: var(--color-#{$color}-500);
        --border-color: var(--color-#{$color}-500);
      }
    }

    &--warning {
      --text-color: var(--color-neutral-900);
      --icon-color: var(--color-warning-50);
    }
  }

  &--solid-light {
    --text-color: var(--color-neutral-900);

    @each $color in $colors {
      &--#{$color} {
        --bg-color: var(--color-#{$color}-50);
        --border-color: var(--color-#{$color}-50);
        --icon-color: var(--color-#{$color}-500);
      }
    }
  }

  &--outline {
    --bg-color: var(--color-additional-50);
    --text-color: var(--color-neutral-900);

    @each $color in $colors {
      &--#{$color} {
        --icon-color: var(--color-#{$color}-500);
        --border-color: var(--color-#{$color}-500);
      }
    }
  }

  &--outline-dark {
    --text-color: var(--color-neutral-900);

    @each $color in $colors {
      &--#{$color} {
        --bg-color: var(--color-#{$color}-50);
        --border-color: var(--color-#{$color}-500);
        --icon-color: var(--color-#{$color}-500);
      }
    }
  }

  &__icon {
    --vc-icon-size: var(--icon-size);
    --vc-icon-color: var(--icon-color);

    @apply shrink-0 mt-0.5 me-2;
  }

  &__content {
    @apply grow flex flex-col justify-center [word-break:break-word];

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
    --vc-icon-size: 0.875rem;
    --vc-icon-color: currentColor;

    @apply flex items-center justify-center -mt-1 -me-2 size-7;
  }
}
</style>
