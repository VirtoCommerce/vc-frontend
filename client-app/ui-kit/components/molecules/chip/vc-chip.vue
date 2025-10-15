<template>
  <component
    :is="clickable ? 'button' : 'span'"
    :disabled="disabled"
    :draggable="draggable && !disabled"
    :class="[
      'vc-chip',
      `vc-chip--size--${size}`,
      `vc-chip--color--${color}`,
      `vc-chip--${variant}--${color}`,
      {
        'vc-chip--disabled': disabled,
        'vc-chip--clickable': clickable,
        'vc-chip--rounded': rounded,
        'vc-chip--truncate': truncate,
        'vc-chip--nowrap': nowrap && !truncate,
      },
    ]"
  >
    <span class="vc-chip__content">
      <VcIcon v-if="icon" :name="icon" class="vc-chip__icon" />

      <slot />
    </span>

    <button
      v-if="closable"
      :disabled="disabled"
      type="button"
      class="vc-chip__close-button"
      :aria-label="closeAriaLabel"
      @click.stop="disabled ? null : $emit('close')"
    >
      <slot name="close-icon">
        <VcIcon name="delete-2" />
      </slot>
    </button>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { getColorValue } from "@/ui-kit/utilities";

interface IEmits {
  (event: "close"): void;
}

interface IProps {
  color?: VcChipColorType;
  variant?: VcChipVariantType;
  size?: VcChipSizeType;
  clickable?: boolean;
  closable?: boolean;
  closeButtonAriaLabel?: string;
  disabled?: boolean;
  draggable?: boolean;
  rounded?: boolean;
  truncate?: boolean;
  nowrap?: boolean;
  icon?: string;
  iconColor?: string;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  color: "primary",
  variant: "solid",
  size: "md",
  nowrap: true,
});

const { t } = useI18n();

const closeAriaLabel = computed(() => props.closeButtonAriaLabel ?? t("ui_kit.accessibility.close_chip"));

const _iconColor = computed(() => getColorValue(props.iconColor));
</script>

<style lang="scss">
.vc-chip {
  --props-icon-color: v-bind(_iconColor);
  --icon-color: var(--props-icon-color, var(--vc-chip-icon-color));
  --radius: var(--vc-chip-radius, var(--vc-radius, 0.5rem));
  /* Default colors (can be overridden by variants below) */
  --bg-color: var(--color-additional-50);
  --border-color: var(--color-additional-50);
  --text-color: var(--color-neutral-800);

  $colors: primary, secondary, success, info, warning, danger, neutral;

  $truncate: "";
  $clickable: "";
  $disabled: "";

  @apply inline-flex justify-between max-w-full rounded-[--radius] border font-bold text-center px-[--padding-x] py-0.5 text-[--text-color] bg-[--bg-color] border-[--border-color];

  &--clickable {
    $clickable: &;
  }

  &--truncate {
    $truncate: &;
  }

  &--nowrap:not(#{$truncate}) {
    @apply w-auto whitespace-nowrap #{!important};
  }

  &--rounded {
    @apply rounded-full;
  }

  &--disabled {
    $disabled: &;
  }

  &--size {
    &--xs {
      --icon-size: 0.5rem;
      --close-button-icon-size: 0.35rem;
      --padding-x: 0.188rem;

      @apply min-h-4 gap-1 text-[0.625rem]/[0.675rem];
    }

    &--sm {
      --icon-size: 0.625rem;
      --close-button-icon-size: 0.5rem;
      --padding-x: 0.345rem;

      @apply min-h-[1.375rem] gap-1 text-xs/[0.75rem];
    }

    &--md {
      --icon-size: 0.75rem;
      --close-button-icon-size: 0.56rem;
      --padding-x: 0.475rem;

      @apply min-h-6 gap-1.5 text-sm/[1.125rem];
    }

    &--lg {
      --icon-size: 0.875rem;
      --close-button-icon-size: 0.7rem;
      --padding-x: 0.6rem;

      @apply min-h-8 gap-1.5 text-sm/[1.25rem];
    }
  }

  @each $color in $colors {
    &--solid--#{$color} {
      --bg-color: var(--color-#{$color}-500);
      --border-color: var(--color-#{$color}-500);
      --text-color: var(--color-additional-50);

      &[class*="--warning"] {
        --text-color: var(--color-warning-900);
      }

      &#{$clickable}:hover {
        --bg-color: var(--color-#{$color}-700);
        --border-color: var(--color-#{$color}-700);
      }
    }

    &--solid-light--#{$color} {
      --bg-color: var(--color-#{$color}-50);
      --border-color: var(--color-#{$color}-50);
      /* текст в оригинале остается var(--text-color) (neutral), не меняем */

      &#{$clickable}:hover {
        --bg-color: var(--color-#{$color}-100);
        --border-color: var(--color-#{$color}-100);
      }
    }

    &--outline--#{$color} {
      --border-color: var(--color-#{$color}-500);

      &#{$clickable}:hover {
        --bg-color: var(--color-#{$color}-50);
      }
    }

    &--outline-dark--#{$color} {
      --bg-color: var(--color-#{$color}-50);
      --border-color: var(--color-#{$color}-500);

      &#{$clickable}:hover {
        --bg-color: var(--color-#{$color}-100);
      }
    }

    &--color--#{$color} {
      &#{$clickable} {
        &:focus {
          @apply ring-[3px] ring-[--color-#{$color}-100];
        }
      }
    }

    &[class*="--#{$color}"]:not(#{$disabled}) {
      --vc-icon-color: var(--icon-color, var(--color-#{$color}-500));
      --close-button-icon-color: var(--color-#{$color}-700);
    }
  }

  &[class*="--solid--"]:not(#{$disabled}) {
    --vc-icon-color: var(--icon-color, var(--text-color));
    --close-button-icon-color: var(--color-additional-50);
  }

  &__content {
    --vc-icon-size: var(--icon-size);

    @apply grow flex items-center justify-center gap-[inherit] max-w-full;

    #{$truncate} &,
    #{$truncate} & > * {
      @apply truncate;
    }
  }

  &__close-button {
    --vc-icon-size: var(--close-button-icon-size);
    --vc-icon-color: var(--close-button-icon-color);

    @apply self-stretch flex items-center ps-1 pe-[--padding-x] -ms-1 -me-[--padding-x] py-[--padding-y] -my-[--padding-y] rounded-r-[inherit];
  }

  &:disabled,
  &--disabled {
    --vc-icon-color: theme("colors.neutral.400");
    --text-color: var(--color-neutral-600);

    @apply cursor-not-allowed;

    &[class*="--solid-"] {
      --bg-color: var(--color-neutral-100);
      --border-color: var(--color-neutral-100);
    }

    &[class*="--outline-"] {
      --border-color: var(--color-neutral-200);
    }

    &[class*="--outline-dark"] {
      --bg-color: var(--color-neutral-50);
      --border-color: var(--color-neutral-200);
    }
  }
}
</style>
