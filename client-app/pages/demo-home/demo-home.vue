<template>
  <div class="demo-home">
    <HeroSection />

    <SuppliersSection />
  </div>
</template>

<script setup lang="ts">
import HeroSection from "./hero-section.vue";
import SuppliersSection from "./suppliers-section.vue";
</script>

<style lang="scss">
.demo-home {
  @apply mx-auto flex w-full max-w-screen-2xl flex-col gap-[1.625rem] px-6 pb-5;
}

@media (width >= theme("screens.lg")) {
  .demo-home {
    @apply px-8 pb-6;
  }
}
</style>
