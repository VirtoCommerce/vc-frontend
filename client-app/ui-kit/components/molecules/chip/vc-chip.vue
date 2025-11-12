<template>
  <span
    :draggable="draggable && !disabled"
    :data-test-id="dataTestId"
    :class="[
      'vc-chip',
      `vc-chip--size--${size}`,
      `vc-chip--color--${color}`,
      `vc-chip--variant--${variant}`,
      {
        'vc-chip--disabled': disabled,
        'vc-chip--clickable': clickable,
        'vc-chip--closable': closable,
        'vc-chip--rounded': rounded,
        'vc-chip--truncate': truncate,
        'vc-chip--nowrap': nowrap && !truncate,
      },
    ]"
  >
    <component
      :is="componentTag"
      v-bind="rootAttrs"
      class="vc-chip__content"
      :disabled="clickable && disabled"
      @click="clickable && !disabled ? $emit('click') : null"
    >
      <VcIcon v-if="icon" :name="icon" class="vc-chip__icon" />

      <slot />
    </component>

    <button
      v-if="closable"
      :disabled="disabled"
      type="button"
      class="vc-chip__close-button"
      :aria-label="closeAriaLabel"
      @click.stop="$emit('close')"
    >
      <slot name="close-icon">
        <VcIcon name="delete-2" />
      </slot>
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { getColorValue } from "@/ui-kit/utilities";
import type { RouteLocationRaw } from "vue-router";

interface IEmits {
  (event: "click"): void;
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
  tabindex?: string | number;
  dataTestId?: string;
  to?: RouteLocationRaw | null;
  externalLink?: string;
  target?: "_self" | "_blank";
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  color: "primary",
  variant: "solid",
  size: "md",
  nowrap: true,
  tabindex: 0,
  to: null,
});

const { t } = useI18n();

const isRouterLink = computed(() => !!props.to && props.clickable && !props.disabled);
const isExternalLink = computed(() => !!props.externalLink && props.clickable && !props.disabled);

const componentTag = computed<string>(() => {
  if (isRouterLink.value) {
    return "router-link";
  }

  if (isExternalLink.value) {
    return "a";
  }

  return props.clickable ? "button" : "span";
});

const rootAttrs = computed<Record<string, unknown>>(() => {
  if (componentTag.value === "button") {
    return {
      type: "button",
      disabled: props.disabled,
      tabindex: props.tabindex,
    };
  }

  if (componentTag.value === "router-link") {
    return {
      to: props.to,
      tabindex: props.tabindex,
    };
  }

  if (componentTag.value === "a") {
    return {
      href: props.externalLink,
      target: props.target,
      tabindex: props.tabindex,
    };
  }

  return {};
});

const closeAriaLabel = computed(() => props.closeButtonAriaLabel ?? t("ui_kit.accessibility.close_chip"));

const _iconColor = computed(() => getColorValue(props.iconColor));
</script>

<style lang="scss">
.vc-chip {
  --props-icon-color: v-bind(_iconColor);
  --icon-color: var(--props-icon-color, var(--vc-chip-icon-color));
  --radius: var(--vc-chip-radius, var(--vc-radius, 0.5rem));

  --bg-color: var(--color-additional-50);
  --border-color: var(--color-additional-50);
  --text-color: var(--color-neutral-800);

  $colors: primary, secondary, success, info, warning, danger, neutral, accent;

  $self: &;
  $v-solid: "";
  $v-solid-light: "";
  $v-outline: "";
  $v-outline-dark: "";
  $truncate: "";
  $clickable: "";
  $closable: "";
  $disabled: "";
  $contentEl: "";

  @apply relative inline-flex max-w-full min-h-[--min-h] rounded-[--radius];

  &--closable {
    $closable: &;
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

  &--clickable:not(#{$disabled}) {
    $clickable: &;
  }

  &--size {
    &--sm {
      --icon-size: 0.625rem;
      --close-button-icon-size: 0.5rem;
      --padding-x: 0.438rem;
      --min-h: 1.5rem;

      @apply gap-1.5 text-xs/[0.75rem];
    }

    &--md {
      --icon-size: 0.75rem;
      --close-button-icon-size: 0.6rem;
      --padding-x: 0.438rem;
      --min-h: 1.75rem;

      @apply gap-1.5 text-sm/[1.125rem];
    }

    &--lg {
      --icon-size: 0.875rem;
      --close-button-icon-size: 0.7rem;
      --padding-x: 0.563rem;
      --min-h: 2rem;

      @apply gap-2 text-sm/[1.25rem];
    }
  }

  &--variant {
    &--solid {
      $v-solid: &;

      --main-icon-color: var(--color-additional-50);
      --close-button-icon-color: var(--color-additional-50);
      --text-color: var(--color-additional-50);
    }

    &--solid-light {
      $v-solid-light: &;
    }

    &--outline {
      $v-outline: &;
    }

    &--outline-dark {
      $v-outline-dark: &;
    }
  }

  &__content {
    $contentEl: &;

    --vc-icon-color: var(--icon-color, var(--main-icon-color));
    --vc-icon-size: var(--icon-size);

    @apply grow flex items-center justify-center gap-[inherit] max-w-full px-[--padding-x] py-0.5 rounded-[inherit] bg-[--bg-color] border border-[--border-color] font-bold text-center text-[--text-color];

    #{$closable} & {
      @apply pe-[--min-h];
    }

    #{$truncate} &,
    #{$truncate} & > * {
      @apply truncate;
    }
  }

  @each $color in $colors {
    &--color--#{$color} {
      --outline-color: rgb(from var(--color-#{$color}-500) r g b / 0.4);

      &#{$v-solid} {
        --bg-color: var(--color-#{$color}-500);
        --border-color: var(--color-#{$color}-500);

        &#{$clickable} #{$contentEl}:hover {
          --bg-color: var(--color-#{$color}-700);
          --border-color: var(--color-#{$color}-700);
        }
      }

      &#{$v-solid-light} {
        --bg-color: var(--color-#{$color}-50);
        --border-color: var(--color-#{$color}-50);
        --main-icon-color: var(--color-#{$color}-500);
        --close-button-icon-color: var(--color-#{$color}-700);

        &#{$clickable} #{$contentEl}:hover {
          --bg-color: var(--color-#{$color}-100);
          --border-color: var(--color-#{$color}-100);
        }
      }

      &#{$v-outline} {
        --border-color: var(--color-#{$color}-500);
        --main-icon-color: var(--color-#{$color}-500);
        --close-button-icon-color: var(--color-#{$color}-700);

        &#{$clickable} #{$contentEl}:hover {
          --bg-color: var(--color-#{$color}-50);
        }
      }

      &#{$v-outline-dark} {
        --bg-color: var(--color-#{$color}-50);
        --border-color: var(--color-#{$color}-500);
        --main-icon-color: var(--color-#{$color}-500);
        --close-button-icon-color: var(--color-#{$color}-700);

        &#{$clickable} #{$contentEl}:hover {
          --bg-color: var(--color-#{$color}-100);
        }
      }
    }
  }

  &--color--warning#{$v-solid} {
    --text-color: var(--color-warning-950);
    --close-button-icon-color: var(--color-warning-950);
  }

  &__close-button {
    --vc-icon-size: var(--close-button-icon-size);
    --vc-icon-color: var(--close-button-icon-color);

    @apply self-stretch absolute inset-y-0 right-0 flex items-center justify-center size-[--min-h] rounded-[inherit];

    .vc-icon {
      @apply transition-transform duration-200 ease-in-out;
    }

    &:hover .vc-icon {
      @apply rotate-90;
    }

    &:disabled {
      @apply cursor-not-allowed;
    }
  }

  &:disabled,
  &#{$disabled} {
    --bg-color: var(--color-neutral-50);
    --border-color: var(--color-neutral-100);
    --main-icon-color: theme("colors.neutral.400");
    --text-color: theme("colors.neutral.500");
    --close-button-icon-color: theme("colors.neutral.400");

    @apply cursor-not-allowed;

    &#{$v-outline} {
      --bg-color: var(--color-additional-50);
      --border-color: var(--color-neutral-200);
    }

    &#{$v-outline-dark} {
      --border-color: var(--color-neutral-200);
    }
  }
}
</style>
