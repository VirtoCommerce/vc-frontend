<template>
  <div class="vc-container">
    <div class="vc-container__wrapper">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss">
.vc-container {
  --vc-container-bg: var(--color-container-bg, theme("colors.gray.100"));

  @apply grow pt-6 pb-8 shadow-inner
  bg-[color:var(--vc-container-bg)];

  &__wrapper {
    @apply px-5 mx-auto max-w-screen-2xl 2xl:px-18;
  }
}
</style>
