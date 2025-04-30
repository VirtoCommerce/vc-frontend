<template>
  <div
    :class="[
      'vc-scrollbar',
      {
        'vc-scrollbar--vertical': vertical,
        'vc-scrollbar--horizontal': horizontal,
        'vc-scrollbar--disabled': disabled,
      },
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface IProps {
  disabled?: boolean;
  vertical?: boolean;
  horizontal?: boolean;
}

withDefaults(defineProps<IProps>(), {
  vertical: true,
  horizontal: false,
  disabled: false,
});
</script>

<style lang="scss">
.vc-scrollbar {
  $vertical: "";
  $horizontal: "";
  $disabled: "";

  overflow: unset;

  &--vertical {
    $vertical: &;

    @apply overflow-y-auto;
  }

  &--horizontal {
    $horizontal: &;

    @apply overflow-x-auto;
  }

  &--disabled {
    $disabled: &;

    @apply overflow-hidden !important;
  }

  &#{$vertical}:not(#{$horizontal}) {
    @apply overflow-x-hidden;
  }

  &#{$horizontal}:not(#{$vertical}) {
    @apply overflow-y-hidden;
  }

  &#{$vertical}:not(#{$disabled}),
  &#{$horizontal}:not(#{$disabled}) {
    &:hover {
      &::-webkit-scrollbar {
        @apply size-2;

        transition: all 0.3s;
      }

      &::-webkit-scrollbar-track {
        @apply opacity-100;
      }

      &::-webkit-scrollbar-thumb {
        @apply opacity-100;
      }
    }

    &::-webkit-scrollbar {
      @apply size-1;
    }

    &::-webkit-scrollbar-track {
      @apply bg-neutral-100 opacity-70 rounded;
    }

    &::-webkit-scrollbar-thumb {
      @apply bg-neutral-400 opacity-70 rounded;
    }
  }
}
</style>
