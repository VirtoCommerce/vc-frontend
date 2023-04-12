<template>
  <span
    :class="[
      'vc-select-item-text',
      { 'vc-select-item-text--error': error, 'vc-select-item-text--placeholder': placeholder },
    ]"
  >
    <span class="vc-select-item-text__title">
      <slot />
    </span>

    <span v-if="$slots.description" class="vc-select-item-text__description">
      <slot name="description" />
    </span>
  </span>
</template>

<script setup lang="ts">
interface IProps {
  placeholder?: boolean;
  error?: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-select-item-text {
  $placeholder: "";
  $error: "";

  @apply grow flex flex-col min-w-0;

  &--placeholder {
    $placeholder: &;
  }

  &--error {
    $error: &;
  }

  &__title {
    @apply text-sm text-[color:var(--color-body-text)] truncate;

    #{$placeholder} & {
      @apply opacity-70;
    }

    #{$error} & {
      @apply text-[color:var(--color-danger)];
    }
  }

  &__description {
    @apply text-xs leading-[0.875rem] text-gray-400 line-clamp-2;

    #{$error} & {
      @apply text-[color:var(--color-danger)] opacity-70;
    }
  }
}
</style>
