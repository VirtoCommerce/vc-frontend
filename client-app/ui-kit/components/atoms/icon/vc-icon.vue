<template>
  <svg :class="['vc-icon', sizeClass]" :style="style">
    <use :href="`/static/icons/basic/${name}.svg#icon`"></use>
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IProps {
  name?: string;
  size?: "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | number;
}

const props = withDefaults(defineProps<IProps>(), {
  name: "document-text",
});

const style = computed(() =>
  typeof props.size === "number"
    ? {
        width: `${props.size}px`,
        height: `${props.size}px`,
      }
    : {},
);

const sizeClass = computed(() => (typeof props.size === "string" ? `vc-icon--size--${props.size}` : ""));
</script>

<style lang="scss">
.vc-icon {
  --size: var(--vc-icon-size, 1.5rem);
  --color: var(--vc-icon-color, inherit);

  $self: &;

  @apply inline-block align-top size-[--size] leading-none text-[--color];

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

    &--lg {
      @apply w-10 h-10;
    }

    &--xl {
      @apply w-12 h-12;
    }

    &--xxl {
      @apply w-16 h-16;
    }
  }

  @at-root .vc-button {
    $icon: "";

    &--icon {
      $icon: &;
    }

    #{$self} {
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
