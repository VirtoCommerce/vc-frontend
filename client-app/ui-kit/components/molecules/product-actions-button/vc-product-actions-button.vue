<template>
  <button
    :aria-label="ariaLabel || tooltipText"
    :aria-pressed="ariaPressed !== undefined ? ariaPressed : undefined"
    :aria-busy="loading || undefined"
    :title="tooltipText"
    type="button"
    :class="[
      'vc-product-actions-button',
      `vc-product-actions-button--color--${color}`,
      {
        'vc-product-actions-button--active': active,
        'vc-product-actions-button--disabled': disabled || loading,
        'vc-product-actions-button--loading': loading,
      },
    ]"
    :disabled="disabled || loading"
    @click="onClick"
  >
    <span class="vc-product-actions-button__content">
      <VcIcon :name="icon" :size="iconSize" aria-hidden="true" />
    </span>

    <span v-if="loading" class="vc-product-actions-button__loader">
      <span class="vc-product-actions-button__loader-icon" />
    </span>
  </button>
</template>

<script setup lang="ts">
interface IEmits {
  (e: "click"): void;
}

interface IProps {
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
  color?: VcProductActionsButtonColorType;
  tooltipText?: string;
  ariaLabel?: string;
  ariaPressed?: boolean;
  icon?: string;
  iconSize?: VcIconSizeType;
}

const emit = defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  color: "primary",
  tooltipText: "",
  icon: "heart",
});

const onClick = () => {
  emit("click");
};
</script>

<style lang="scss">
.vc-product-actions-button {
  $colors: primary, secondary, success, info, neutral, warning, danger, accent;
  $active: "";
  $loading: "";
  $loaderIcon: "";

  // Ensure minimum 24x24px touch target (p-1.5 = 6px each side, with icon gives ~24px)
  @apply relative flex justify-center items-center p-1.5 min-w-6 min-h-6 rounded;

  // Focus-visible styles with sufficient contrast
  &:focus-visible {
    @apply outline outline-2 outline-offset-2 outline-[--focus-color];
  }

  &:disabled,
  &--disabled {
    @apply text-neutral-300 cursor-not-allowed;
  }

  &--active {
    $active: &;
  }

  &--loading {
    $loading: &;
  }

  @each $color in $colors {
    &--color--#{$color} {
      --focus-color: var(--color-#{$color}-500);

      color: var(--color-#{$color}-500);

      #{$loaderIcon} {
        --loader-border: var(--color-#{$color}-200);
        --loader-border-r: var(--color-#{$color}-500);
      }
    }
  }

  &:not(#{$active}) {
    --focus-color: var(--color-neutral-500);

    @apply text-neutral-400;

    #{$loaderIcon} {
      --loader-border: var(--color-neutral-200);
      --loader-border-r: var(--color-neutral-500);
    }
  }

  &__content {
    #{$loading} & {
      @apply invisible;
    }
  }

  &__loader {
    @apply hidden;

    #{$loading} & {
      @apply absolute inset-0 flex justify-center items-center;
    }
  }

  &__loader-icon {
    $loaderIcon: &;

    @apply block size-4 rounded-full animate-spin border-2 border-[--loader-border] border-r-[--loader-border-r];
  }
}
</style>
