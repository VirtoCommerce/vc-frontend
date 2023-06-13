<template>
  <svg :class="['vc-icon', sizeClass]" :style="style">
    <use :href="`/static/icons/basic/${name}.svg#icon`"></use>
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IProps {
  name?: string;
  size?: "xxs" | "xs" | "sm" | "md" | number;
}

const props = withDefaults(defineProps<IProps>(), {
  name: "document-text",
  size: "md",
});

const style = computed(() =>
  typeof props.size === "number"
    ? {
        width: `${props.size}px`,
        height: `${props.size}px`,
      }
    : {}
);

const sizeClass = computed(() => (typeof props.size === "string" ? `vc-icon--size--${props.size}` : ""));
</script>

<style lang="scss">
.vc-icon {
  $self: &;

  @apply inline-block align-top leading-none text-inherit;

  &--size {
    &--xxs {
      @apply w-2.5 h-2.5;
    }

    &--xs {
      @apply w-3.5 h-3.5;
    }

    &--sm {
      @apply w-5 h-5;
    }

    &--md {
      @apply w-6 h-6;
    }
  }

  @at-root .vc-button {
    $icon: "";

    &--icon {
      $icon: &;
    }

    #{$self} {
      @apply w-[--vc-button-line-height] h-[--vc-button-line-height];

      &:first-child:not(:last-child) {
        @apply me-2;
      }

      &:last-child:not(:first-child) {
        @apply ms-2;
      }
    }

    &__slot {
      #{$icon} & {
        & > #{$self} {
          @apply mx-0 #{!important};
        }

        & > *:not(#{$self}) {
          @apply hidden;
        }
      }
    }
  }
}
</style>
