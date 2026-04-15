<template>
  <div
    :class="[
      'page-toolbar-block',
      {
        'page-toolbar-block--stick': stick,
        'page-toolbar-block--shadow': stick && shadow,
      },
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface IProps {
  stick: boolean;
  shadow: boolean;
}

defineProps<IProps>();

// eslint-disable-next-line no-console
console.warn("[PageToolbarBlock] This component is deprecated. Consider using a custom implementation.");
</script>

<style lang="scss">
.page-toolbar-block {
  @apply sticky top-0;

  @media (width >= theme("screens.lg")) {
    @apply relative;
  }

  &--stick {
    @apply z-40 -mx-6 bg-additional-50 px-5 py-3.5;
  }

  &--shadow {
    @apply shadow-md;
  }
}
</style>
