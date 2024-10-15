<template>
  <svg :class="['vc-icon', sizeClass]" :style="style">
    <use :href="`/static/icons/basic/${name}.svg#icon`"></use>
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IProps {
  name?: string;
  size?: VcIconSizeType;
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
  --color: var(--vc-icon-color, currentColor);

  $self: &;

  @apply inline-block align-top size-[--size] leading-none fill-[--color] text-[--color];

  &--size {
    &--xxs {
      @apply size-2.5;
    }

    &--xs {
      @apply size-3.5;
    }

    &--sm {
      @apply size-5;
    }

    &--lg {
      @apply size-10;
    }

    &--xl {
      @apply size-12;
    }

    &--xxl {
      @apply size-16;
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
