<template>
  <div
    :class="[
      'vc-alert',
      `vc-alert--${canonicalVariant}--${color}`,
      `vc-alert--size--${size}`,
      {
        'vc-alert--shadow': shadow,
      },
    ]"
  >
    <div v-if="icon || $slots['main-icon']" class="vc-alert__icon">
      <slot name="main-icon">
        <VcIcon :name="iconName" />
      </slot>
    </div>

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
import { resolveVariant } from "../../../utilities/variant-compat";

interface IEmits {
  (event: "close"): void;
}

interface IProps {
  color?: VcAlertColorType;
  icon?: boolean | string;
  variant?: VcAlertVariantType;
  size?: VcAlertSizeType;
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

const canonicalVariant = computed(() => resolveVariant("VcAlert", props.variant));

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
  --radius: var(--vc-alert-radius, var(--vc-radius, 0.5rem));

  @apply flex items-start border rounded-[--radius] bg-[--bg-color] border-[--border-color] text-[--text-color];

  &--shadow {
    @apply shadow-lg;
  }

  &--size {
    &--sm {
      --icon-size: 1.125rem;

      @apply ps-[0.438rem] pe-[0.625rem] py-[0.313rem] text-xs/[0.875rem];
    }

    &--md {
      --icon-size: 1.25rem;

      @apply p-[0.688rem] text-sm/[1.125rem];
    }
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

  &__icon {
    --vc-icon-size: var(--icon-size);
    --vc-icon-color: var(--icon-color);

    @apply shrink-0 me-2;
  }

  &__content {
    @apply grow self-center flex flex-col justify-center [word-break:break-word];

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
    --vc-icon-color: var(--close-button-icon-color);

    @apply flex items-center justify-center -my-1 -me-2 size-7;
  }
}
</style>
