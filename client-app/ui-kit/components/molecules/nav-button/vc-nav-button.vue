<template>
  <button
    type="button"
    :aria-label="accessibleLabel"
    :aria-disabled="disabled"
    :disabled="disabled"
    :class="['vc-nav-button', `vc-nav-button--size--${size}`]"
    @click="$emit('click', $event)"
  >
    <VcIcon :name="iconName" aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

export interface IEmits {
  (event: "click", value: MouseEvent): void;
}

interface IProps {
  size?: "xs" | "sm" | "md";
  direction?: "left" | "right" | "up" | "down";
  disabled?: boolean;
  label?: string;
  icon?: string;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  size: "md",
  direction: "right",
  disabled: false,
});

const { t } = useI18n();

const directionLabelKeys: Record<NonNullable<IProps["direction"]>, string> = {
  left: "ui_kit.accessibility.nav_previous",
  right: "ui_kit.accessibility.nav_next",
  up: "ui_kit.accessibility.nav_up",
  down: "ui_kit.accessibility.nav_down",
};

const iconName = computed(() => props.icon || `chevron-${props.direction}`);
const accessibleLabel = computed(() => props.label || t(directionLabelKeys[props.direction]));
</script>

<style lang="scss">
.vc-nav-button {
  @apply flex-none flex items-center justify-center rounded-full shadow-xl bg-additional-50 text-primary;
  @apply outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;

  @media (prefers-reduced-motion: no-preference) {
    @apply transition-colors;
  }

  &--size {
    &--xs {
      --vc-icon-size: 0.875rem;

      @apply w-7 h-7;
    }

    &--sm {
      --vc-icon-size: 1rem;

      @apply w-9 h-9;
    }

    &--md {
      --vc-icon-size: 1.5rem;

      @apply w-14 h-14;
    }
  }

  &:hover:not(:disabled) {
    @apply text-primary-700;
  }

  &:disabled {
    @apply text-neutral-400 cursor-not-allowed;
  }
}
</style>
