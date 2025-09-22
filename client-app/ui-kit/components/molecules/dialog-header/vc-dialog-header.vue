<template>
  <div
:class="[
    'vc-dialog-header',
    `vc-dialog-header--color--${color}`,
    `vc-dialog-header--size--${sizeStr}`,
  ]">
    <slot name="main">
      <div class="vc-dialog-header__main">
        <div v-if="icon" class="vc-dialog-header__icon">
          <VcIcon :name="icon" />
        </div>

        <div class="vc-dialog-header__title">
          <slot />
        </div>
      </div>
    </slot>

    <button
      v-if="closable"
      type="button"
      class="vc-dialog-header__close"
      :aria-label="$t('ui_kit.buttons.close')"
      @click="$emit('close')"
    >
      <VcIcon name="delete-thin" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, computed } from "vue";
import { vcDialogKey } from "../../atoms/dialog/vc-dialog-context";

export interface IEmits {
  (event: "close"): void;
}

export interface IProps {
  color?: VcMainColorType;
  icon?: string;
  closable?: boolean;
  size?: VcDialogSizeType;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  color: "info",
  closable: true,
});

const dialogContext = inject(vcDialogKey, { size: ref("md") });
const sizeStr = computed(() => props.size ?? dialogContext.size.value);
</script>

<style lang="scss">
.vc-dialog-header {
  $colors: primary, secondary, success, info, warning, danger, neutral, accent;

  --vc-icon-size: calc(var(--icon-size) / 2);

  grid-area: vc-dialog-header;

  @apply flex;

  &--color {
    @each $color in $colors {
      &--#{$color} {
        --vc-icon-color: var(--color-#{$color}-500);
        --icon-bg-color: var(--color-#{$color}-50);
      }
    }
  }

  &--size {
    &--xs {
      --min-h: 3.25rem;
      --icon-size: 2rem;
      --font-size: 1rem;
    }

    &--sm {
      --min-h: 3.5rem;
      --icon-size: 2rem;
      --font-size: 1.125rem;
    }

    &--md {
      --min-h: 4.25rem;
      --icon-size: 2.5rem;
      --font-size: 1.25rem;
    }
  }

  &__main {
    @apply flex-grow flex flex-col justify-center gap-3 py-3 px-6 min-h-[--min-h];
  }

  &__icon {

    @apply flex-none flex items-center justify-center size-[--icon-size] bg-[--icon-bg-color] rounded-full;
  }

  &__title {
    @apply text-[length:var(--font-size)] font-bold;
  }

  &__close {
    --vc-icon-color: theme("colors.secondary.600");

    @apply flex-none flex items-center justify-center size-[--min-h];
  }
}
</style>
