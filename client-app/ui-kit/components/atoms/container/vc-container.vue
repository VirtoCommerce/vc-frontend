<template>
  <div class="vc-container">
    <div class="vc-container__wrapper">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss">
$VcContainerBg: var(--vc-container-bg, theme("colors.gray.100"));

.vc-container {
  @apply grow pt-6 pb-8 shadow-inner;

  background-color: $VcContainerBg;

  &__wrapper {
    @apply px-5 mx-auto max-w-screen-2xl 2xl:px-18;
  }
}
</style>
