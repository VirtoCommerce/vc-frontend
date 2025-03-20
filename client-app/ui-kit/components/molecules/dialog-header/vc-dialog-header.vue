<template>
  <div :class="['vc-dialog-header', `vc-dialog-header--color--${color}`]">
    <slot name="main">
      <div class="vc-dialog-header__main">
        <div v-if="icon" class="vc-dialog-header__icon">
          <VcIcon :name="icon" size="sm" />
        </div>

        <div class="vc-dialog-header__title">
          <slot />
        </div>
      </div>
    </slot>

    <button v-if="closable" type="button" class="vc-dialog-header__close" @click="$emit('close')">
      <VcIcon name="delete-thin" :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
export interface IEmits {
  (event: "close"): void;
}

export interface IProps {
  color?: "primary" | "secondary" | "info" | "success" | "warning" | "danger" | "neutral" | "accent";
  icon?: string;
  closable?: boolean;
}

defineEmits<IEmits>();
withDefaults(defineProps<IProps>(), {
  color: "info",
  closable: true,
});
</script>

<style lang="scss">
.vc-dialog-header {
  $colors: primary, secondary, success, info, warning, danger, neutral, accent;

  grid-area: vc-dialog-header;

  @apply flex;

  &--color {
    @each $color in $colors {
      &--#{$color} {
        --icon-color: var(--color-#{$color}-500);
        --icon-bg-color: var(--color-#{$color}-50);
      }
    }
  }

  &__main {
    @apply flex-grow flex flex-col justify-center gap-3 py-3 px-6 min-h-[4.25rem];
  }

  &__icon {
    @apply flex-none flex items-center justify-center size-10 bg-[--icon-bg-color] rounded-full text-[--icon-color];
  }

  &__title {
    @apply text-xl font-bold;
  }

  &__close {
    @apply flex-none flex items-center justify-center size-[4.25rem] text-secondary;
  }
}
</style>
