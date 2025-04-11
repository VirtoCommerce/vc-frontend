<template>
  <button
    :aria-label="tooltipText"
    :title="tooltipText"
    type="button"
    tabindex="0"
    :class="[
      'vc-product-actions-button',
      `vc-product-actions-button--color--${color}`,
      {
        'vc-product-actions-button--active': active,
        'vc-product-actions-button--disabled': disabled,
      },
    ]"
    :disabled="disabled"
    @click="onClick"
  >
    <VcIcon :name="icon" :size="iconSize" />
  </button>
</template>

<script setup lang="ts">
interface IEmits {
  (e: "click"): void;
}

interface IProps {
  disabled?: boolean;
  active?: boolean;
  color?: VcProductActionsButtonColorType;
  tooltipText?: string;
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

  @apply flex justify-center items-center p-1;

  &:disabled,
  &--disabled {
    @apply text-neutral-300;
  }

  &--active {
    $active: &;
  }

  @each $color in $colors {
    &--color--#{$color} {
      @apply text-[--color-#{$color}-500];
    }
  }

  &:not(#{$active}) {
    @apply text-neutral-400;
  }
}
</style>
