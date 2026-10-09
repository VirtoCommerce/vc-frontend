<template>
  <transition name="fade" appear>
    <div v-if="visible" v-bind="$attrs" :class="['vc-loader-overlay', { 'vc-loader-overlay--with-bg': !noBg }]">
      <div :class="['vc-loader-overlay__spinner', { 'vc-loader-overlay__spinner--fixed': fixedSpinner }]">
        <VcLoader class="vc-loader-overlay__loader" />

        <div v-if="$slots.default" class="vc-loader-overlay__content">
          <slot />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
interface IProps {
  visible?: boolean;
  fixedSpinner?: boolean;
  noBg?: boolean;
}

defineOptions({
  inheritAttrs: false,
});

withDefaults(defineProps<IProps>(), {
  visible: true,
});
</script>

<style lang="scss">
.vc-loader-overlay {
  @apply absolute inset-0 z-[996];

  &--with-bg {
    @apply bg-additional-50/60;
  }

  &__spinner {
    @apply absolute top-1/2 left-1/2 flex flex-col items-center -translate-y-1/2 -translate-x-1/2 text-primary;

    &--fixed {
      @apply fixed;
    }
  }

  &__loader {
    @apply h-6 w-6;
  }

  &__content {
    @apply mt-3 max-w-[60ch] text-center text-sm text-additional-950;
  }
}
</style>
