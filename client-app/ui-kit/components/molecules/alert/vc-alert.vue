<template>
  <div
    :class="[
      'vc-alert',
      `vc-alert--${canonicalVariant}--${color}`,
      `vc-alert--size--${size}`,
      {
        'vc-alert--shadow': shadow,
        'vc-alert--button-end': isButtonEnd,
      },
    ]"
  >
    <DefineActionButton>
      <VcButton size="xxs" :color="buttonColor" :variant="buttonVariant" @click="$emit('buttonClick')">
        {{ buttonText }}
      </VcButton>
    </DefineActionButton>

    <div v-if="icon || $slots['main-icon']" class="vc-alert__icon">
      <slot name="main-icon">
        <VcIcon :name="iconName" />
      </slot>
    </div>

    <div class="vc-alert__content">
      <div v-if="title" class="vc-alert__title">{{ title }}</div>

      <slot />

      <div v-if="buttonText && !isButtonEnd" class="vc-alert__button vc-alert__button--bottom">
        <ReuseActionButton />
      </div>
    </div>

    <div v-if="isButtonEnd" class="vc-alert__button vc-alert__button--end">
      <ReuseActionButton />
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
import { createReusableTemplate } from "@vueuse/core";
import { computed } from "vue";
import { resolveVariant } from "../../../utilities/variant-compat";

interface IEmits {
  (event: "close"): void;
  (event: "buttonClick"): void;
}

interface IProps {
  color?: VcAlertColorType;
  icon?: boolean | string;
  variant?: VcAlertVariantType;
  size?: VcAlertSizeType;
  title?: string;
  shadow?: boolean;
  closable?: boolean;
  buttonText?: string;
  buttonPosition?: VcAlertButtonPositionType;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  variant: "solid",
  color: "info",
  size: "md",
  buttonPosition: "bottom",
});

const DEFAULT_ALERT_VARIANT: VcAlertVariantType = "solid";
const CANONICAL_ALERT_VARIANTS: readonly VcAlertVariantType[] = [DEFAULT_ALERT_VARIANT, "soft", "outline", "tonal"];

const canonicalVariant = computed<VcAlertVariantType>(() => {
  const resolved = resolveVariant("VcAlert", props.variant);
  return (CANONICAL_ALERT_VARIANTS as readonly string[]).includes(resolved)
    ? (resolved as VcAlertVariantType)
    : DEFAULT_ALERT_VARIANT;
});

const [DefineActionButton, ReuseActionButton] = createReusableTemplate();

// Only "end" is special: any other value (a typo, a string from settings) falls back to "bottom".
const isButtonEnd = computed<boolean>(() => !!props.buttonText && props.buttonPosition === "end");

const buttonColor = computed<VcButtonColorType>(() => (canonicalVariant.value === "solid" ? "accent" : "secondary"));
const buttonVariant = computed<VcButtonVariantType>(() => (canonicalVariant.value === "solid" ? "surface" : "outline"));

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
  $sm: "";
  $buttonEnd: "";

  --radius: var(--vc-alert-radius, var(--vc-radius, 0.5rem));

  @apply flex items-start border rounded-[--radius] bg-[--bg-color] border-[--border-color] text-[--text-color];

  &--shadow {
    @apply shadow-lg;
  }

  &--size {
    &--sm {
      $sm: &;

      --icon-size: 1.125rem;
      --line-height: 0.875rem;

      @apply ps-[0.438rem] pe-[0.625rem] py-[0.438rem] text-xs/[--line-height];
    }

    &--md {
      --icon-size: 1.25rem;
      --line-height: 1.125rem;

      @apply p-[0.688rem] text-sm/[--line-height];
    }
  }

  // With an action button in the end position the alert is taller than the text's
  // line box: the button and the close button center on the alert. A one-line text
  // centers with them; with a title or wrapped text the icon stays on the first line,
  // as in the bottom-button layout — icon and content align by their first baseline.
  &--button-end {
    $buttonEnd: &;

    @apply items-center;
  }

  $colors: info, success, warning, danger;
  $variants: solid, soft, outline, tonal;

  --close-button-icon-color: var(--text-color);

  @each $variant in $variants {
    @each $color in $colors {
      &--#{$variant}--#{$color} {
        --bg-color: var(--vc-alert-#{$variant}-#{$color}-bg);
        --border-color: var(--vc-alert-#{$variant}-#{$color}-border);
        --text-color: var(--vc-alert-#{$variant}-#{$color}-text);
        --icon-color: var(--vc-alert-#{$variant}-#{$color}-icon);
      }
    }
  }

  // A one-line alert without a title has the icon, text and close button on one
  // vertical center; when the text wraps, nothing re-centers — the icon and the
  // close button stay anchored to the first line and new lines are added below.
  // The symmetric negative margin-block keeps each control's margin box equal to
  // the line height, so a one-line alert keeps its minimal symmetric height.
  &__icon {
    --vc-icon-size: var(--icon-size);
    --vc-icon-color: var(--icon-color);

    @apply shrink-0 me-2 my-[calc((var(--line-height)_-_var(--icon-size))/2)];

    #{$buttonEnd} & {
      @apply self-baseline flex items-center my-0 h-[--line-height] leading-[--line-height];

      // a zero-width character gives the icon box a text baseline matching the content
      &::before {
        content: "\200b";

        @apply w-0 overflow-hidden;
      }
    }
  }

  &__content {
    @apply grow flex flex-col [word-break:break-word];

    &:first-child {
      @apply ps-1;

      &:last-child {
        @apply px-1;
      }
    }

    #{$buttonEnd} & {
      // the xxs button height: a one-line text centers on the button
      @apply self-baseline justify-center min-h-[1.625rem];
    }
  }

  &__title {
    @apply mb-0.5 font-bold;
  }

  &__close-button {
    --close-button-size: 1.75rem;
    --vc-icon-size: 0.875rem;
    --vc-icon-color: var(--close-button-icon-color);

    @apply flex items-center justify-center my-[calc((var(--line-height)_-_var(--close-button-size))/2)] -me-2 size-[--close-button-size];

    #{$buttonEnd} & {
      @apply ms-1;
    }
  }

  &__button {
    @apply flex shrink-0;

    &--bottom {
      @apply mt-2;

      #{$sm} & {
        @apply mt-1.5;
      }
    }

    &--end {
      @apply ms-3;
    }
  }
}
</style>
