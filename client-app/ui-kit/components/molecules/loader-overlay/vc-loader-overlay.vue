<template>
  <transition name="fade" appear>
    <div v-if="visible" v-bind="$attrs" :class="['vc-loader-overlay', { 'vc-loader-overlay--with-bg': !noBg }]">
      <div :class="['vc-loader-overlay__spinner', { 'vc-loader-overlay__spinner--fixed': fixedSpinner }]">
        <VcLoader />
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
    @apply bg-[color:rgba(255,255,255,0.6)];
  }

  &__spinner {
    @apply absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 text-primary;

    &--fixed {
      @apply fixed;
    }
  }
}
</style>
