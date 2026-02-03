<template>
  <VcScrollbar
    :class="[
      'vc-dialog-content',
      {
        'vc-dialog-content--scrollable': scrollable,
      },
    ]"
    :vertical="scrollable"
  >
    <slot name="container">
      <div class="vc-dialog-content__container">
        <slot />
      </div>
    </slot>
  </VcScrollbar>
</template>

<script setup lang="ts">
interface IProps {
  scrollable?: boolean;
}

withDefaults(defineProps<IProps>(), {
  scrollable: true,
});
</script>

<style lang="scss">
.vc-dialog-content {
  $scrollable: "";

  grid-area: vc-dialog-content;

  @apply min-w-0;

  &--scrollable {
    $scrollable: &;
  }

  &:not(#{$scrollable}) {
    @apply h-full max-h-full min-h-0;
  }

  &__container {
    @apply py-4 px-6 min-h-0 h-full max-h-full flex flex-col;

    #{$scrollable} & {
      @apply h-max;
    }
  }
}
</style>
