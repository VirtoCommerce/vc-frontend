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
// The page rolls its own shell instead of a VcContainer, so it repeats the container's
// arithmetic rather than a width of its own: the cap is the content column PLUS its two
// gutters, and the gutter is then spent as padding — which is what puts the sections on
// exactly the column the header and footer plates stand on. `max-w-screen-2xl` used to
// stand here, and a breakpoint is not a content width: it pinned the page to whatever
// 2xl happened to be and never saw the theme's wide rung.
.demo-home {
  @apply mx-auto flex w-full flex-col gap-[1.625rem] py-5;

  --gutter: var(--page-gutter, theme("padding.6"));

  max-width: calc(var(--vc-container-max-width, 87.75rem) + 2 * var(--gutter));
  padding-inline: var(--gutter);
}

@media (width >= theme("screens.lg")) {
  .demo-home {
    @apply py-6;
  }
}
</style>
