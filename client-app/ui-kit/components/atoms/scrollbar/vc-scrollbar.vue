<template>
  <component
    :is="tag"
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
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getColorValue } from "@/ui-kit/utilities";

interface IProps {
  disabled?: boolean;
  vertical?: boolean;
  horizontal?: boolean;
  tag?: string;
  trackColor?: string;
  thumbColor?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  vertical: false,
  horizontal: false,
  disabled: false,
  tag: "div",
  trackColor: "",
  thumbColor: "",
});

const _trackColor = computed(() => getColorValue(props.trackColor));
const _thumbColor = computed(() => getColorValue(props.thumbColor));
</script>

<style lang="scss">
.vc-scrollbar {
  $vertical: "";
  $horizontal: "";
  $disabled: "";

  --props-track-color: v-bind(_trackColor);
  --track-color: var(--vc-scrollbar-track-color, var(--props-track-color, theme("colors.neutral.100")));

  --props-thumb-color: v-bind(_thumbColor);
  --thumb-color: var(--vc-scrollbar-thumb-color, var(--props-thumb-color, theme("colors.neutral.400")));

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

  &#{$horizontal},
  &#{$vertical} {
    scroll-behavior: smooth;

    /* Firefox */
    @supports not selector(::-webkit-scrollbar) {
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: var(--thumb-color) var(--track-color);
    }

    /* webkit */
    &:hover {
      &::-webkit-scrollbar-track {
        @apply opacity-100;
      }

      &::-webkit-scrollbar-thumb {
        @apply opacity-100;
      }
    }

    &::-webkit-scrollbar {
      @apply size-1.5;
    }

    &::-webkit-scrollbar-track {
      @apply bg-[--track-color] opacity-70 rounded;
    }

    &::-webkit-scrollbar-thumb {
      @apply bg-[--thumb-color] opacity-70 rounded;
    }
  }
}
</style>
