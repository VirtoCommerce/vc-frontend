<template>
  <div class="demo-home">
    <HeroSection />

    <CategoriesSection />

    <PopularSection />

    <SuppliersSection />

    <WhyBuySection />

    <ChangesSection />

    <BrandsSection />

    <CtaSection />
  </div>
</template>

<script setup lang="ts">
import BrandsSection from "./brands-section.vue";
import CategoriesSection from "./categories-section.vue";
import ChangesSection from "./changes-section.vue";
import CtaSection from "./cta-section.vue";
import HeroSection from "./hero-section.vue";
import PopularSection from "./popular-section.vue";
import SuppliersSection from "./suppliers-section.vue";
import WhyBuySection from "./why-buy-section.vue";
</script>

<style lang="scss">
.demo-home {
  @apply mx-auto flex w-full max-w-screen-2xl flex-col gap-[1.625rem] px-6 py-5;
}

@media (width >= theme("screens.lg")) {
  .demo-home {
    @apply px-8 py-6;
  }
}
</style>
